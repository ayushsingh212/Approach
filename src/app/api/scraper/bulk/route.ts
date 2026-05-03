import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Company from "@/src/models/CompanySchema";
import User from "@/src/models/UserSchema";
import { inferCategory } from "@/src/lib/inferCategory";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validateApiKey(req: NextRequest): boolean {
  return req.headers.get("x-api-key") === process.env.SCRAPER_API_KEY;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
  }

  let body: { records?: any[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
  }

  const { records } = body;
  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ saved: 0, total: 0 }, { status: 200, headers: CORS });
  }

  await connectDB();
  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  if (!admin) return NextResponse.json({ error: "No admin" }, { status: 500, headers: CORS });

  const validDocs = [];
  for (const r of records) {
    if (!r.email || !EMAIL_REGEX.test(r.email.trim())) continue;
    
    const normalizedEmail = r.email.trim().toLowerCase();
    
    // Check for duplicate in this batch or DB
    const categories = inferCategory(r.jobTitle ?? null, r.companyName ?? null);
    
    validDocs.push({
      email: normalizedEmail,
      name: r.companyName?.trim() || "HR",
      category: categories, // ✅ Now correctly passes an ARRAY
      addedBy: admin._id,
      location: r.location?.trim() || null,
      website: r.website?.trim() || null,
    });
  }

  try {
    // ordered: false allows it to skip duplicates and keep going
    const result = await Company.insertMany(validDocs, { ordered: false, rawResult: true });
    return NextResponse.json({ saved: result.insertedCount, total: records.length }, { status: 200, headers: CORS });
  } catch (err: any) {
    // Handle partial success (some were duplicates)
    const saved = err.result?.insertedCount ?? 0;
    return NextResponse.json({ saved, total: records.length }, { status: 200, headers: CORS });
  }
}
