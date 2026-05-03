import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { connectDB } from "@/src/lib/db";
import Company from "@/src/models/CompanySchema";
import { rateLimiter, rateLimitResponse } from "@/src/lib/rateLimiter";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ── 1. Rate Limiting ──────────────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success, retryAfter } = rateLimiter(`search-companies-${ip}`, {
      limit: 30,        // 30 requests
      windowMs: 60000,  // per minute
    });

    if (!success) {
      return rateLimitResponse(retryAfter);
    }

    const { searchParams } = new URL(req.url);
    const search   = searchParams.get("search")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit    = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const skip     = (page - 1) * limit;

    // ── 2. Build filter ──────────────────────────────────────────────────────────
    const filter: Record<string, any> = { isActive: true };

    if (search) {
      // Use MongoDB full-text index (name + category + tags + location)
      filter.$text = { $search: search };
    }

    if (category) {
      const categories = category.split(",").filter(Boolean);
      if (categories.length > 0) {
        filter.category = { $in: categories };
      }
    }

    // ── Query ─────────────────────────────────────────────────────────────────
    const [companies, total] = await Promise.all([
      Company.find(filter)
        .select("name email category website location description tags")
        .sort(search ? { score: { $meta: "textScore" } } : { name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[COMPANY SEARCH ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}