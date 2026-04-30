import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Company from "@/src/models/CompanySchema";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateApiKey(req: NextRequest): boolean {
  return req.headers.get("x-api-key") === process.env.SCRAPER_API_KEY;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

// ─── OPTIONS (preflight) ──────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ─── GET /api/scraper/companies ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Auth
  if (!validateApiKey(req)) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing X-API-Key" },
      { status: 401, headers: CORS },
    );
  }

  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const category = searchParams.get("category") ?? "";
  const search   = searchParams.get("search")   ?? "";

  // Build filter
  const filter: Record<string, unknown> = { isActive: true };
  if (category) filter.category = category;

  // MongoDB text-index search (name, tags, location are indexed)
  if (search) {
    filter.$text = { $search: search };
  }

  try {
    await connectDB();

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        companies,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200, headers: CORS },
    );
  } catch (err) {
    console.error("[GET /api/scraper/companies]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS },
    );
  }
}
