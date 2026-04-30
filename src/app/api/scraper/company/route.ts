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

// ─── OPTIONS (preflight) ──────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ─── POST /api/scraper/company ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth
  if (!validateApiKey(req)) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing X-API-Key" },
      { status: 401, headers: CORS },
    );
  }

  // 2. Parse body
  let body: {
    email?: string;
    companyName?: string | null;
    jobTitle?: string | null;
    location?: string | null;
    website?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS },
    );
  }

  const {
    email,
    companyName = null,
    jobTitle = null,
    location = null,
    website = null,
  } = body;

  // 3. Validate email
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: "Invalid or missing email address" },
      { status: 400, headers: CORS },
    );
  }

  // 4. Derive fields
  const resolvedName = companyName?.trim() || "HR";
  const category = inferCategory(jobTitle, companyName);

  // 5. Get admin user for addedBy
  await connectDB();

  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  if (!admin) {
    return NextResponse.json(
      { error: "No admin user found to assign addedBy" },
      { status: 500, headers: CORS },
    );
  }

  // 6. Build document — omit null optional fields
  const doc: Record<string, unknown> = {
    email: email.trim().toLowerCase(),
    name: resolvedName,
    category,
    addedBy: admin._id,
  };
  if (location) doc.location = location.trim();
  if (website) doc.website = website.trim();

  // 7. Insert
  try {
    const created = await Company.create(doc);
    return NextResponse.json(
      { success: true, duplicate: false, companyId: created._id },
      { status: 201, headers: CORS },
    );
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr?.code === 11000) {
      return NextResponse.json(
        { success: true, duplicate: true },
        { status: 200, headers: CORS },
      );
    }
    console.error("[POST /api/scraper/company]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS },
    );
  }
}
