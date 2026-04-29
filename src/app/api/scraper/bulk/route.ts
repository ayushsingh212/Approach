import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Company from "@/src/models/CompanySchema";
import User from "@/src/models/UserSchema";
import { inferCategory } from "@/src/lib/inferCategory";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validateApiKey(req: NextRequest): boolean {
  return req.headers.get("x-api-key") === process.env.SCRAPER_API_KEY;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

// ─── Record shape from the extension ─────────────────────────────────────────

interface ScrapedRecord {
  email: string;
  companyName?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  website?: string | null;
}

// ─── OPTIONS (preflight) ──────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ─── POST /api/scraper/bulk ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth
  if (!validateApiKey(req)) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing X-API-Key" },
      { status: 401, headers: CORS },
    );
  }

  // 2. Parse body
  let body: { records?: unknown[]; completedAt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS },
    );
  }

  const { records } = body;

  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json(
      { error: "records must be a non-empty array" },
      { status: 400, headers: CORS },
    );
  }

  // 3. Validate + deduplicate by email (lowercase)
  const seen = new Set<string>();
  const valid: ScrapedRecord[] = [];

  for (const raw of records) {
    const r = raw as ScrapedRecord;
    if (!r.email || !EMAIL_REGEX.test(r.email.trim())) continue;
    const normalized = r.email.trim().toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    valid.push({ ...r, email: normalized });
  }

  if (valid.length === 0) {
    return NextResponse.json(
      { saved: 0, duplicates: 0, total: records.length },
      { status: 200, headers: CORS },
    );
  }

  // 4. Get admin user once
  await connectDB();

  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  if (!admin) {
    return NextResponse.json(
      { error: "No admin user found to assign addedBy" },
      { status: 500, headers: CORS },
    );
  }

  // 5. Build documents
  const docs = valid.map((r) => {
    const category = inferCategory(r.jobTitle ?? null, r.companyName ?? null);
    const doc: Record<string, unknown> = {
      email: r.email,
      name: r.companyName?.trim() || "HR",
      category,
      addedBy: admin._id,
    };
    if (r.location) doc.location = r.location.trim();
    if (r.website) doc.website = r.website.trim();
    return doc;
  });

  // 6. insertMany — ordered:false continues past duplicate key errors
  try {
    const result = await Company.insertMany(docs, {
      ordered: false,
      rawResult: true,
    });

    const saved = result.insertedCount ?? 0;
    const duplicates = valid.length - saved;

    return NextResponse.json(
      { saved, duplicates, total: records.length },
      { status: 200, headers: CORS },
    );
  } catch (err: unknown) {
    // MongoBulkWriteError — partial success
    if (
      typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name: string }).name === "MongoBulkWriteError"
    ) {
      const bulkErr = err as {
        result?: { insertedCount?: number };
        writeErrors?: Array<{ code: number }>;
      };
      const saved = bulkErr.result?.insertedCount ?? 0;
      const duplicates = valid.length - saved;
      return NextResponse.json(
        { saved, duplicates, total: records.length },
        { status: 200, headers: CORS },
      );
    }

    console.error("[POST /api/scraper/bulk]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS },
    );
  }
}
