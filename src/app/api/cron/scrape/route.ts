import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Company from "@/src/models/CompanySchema";
import User from "@/src/models/UserSchema";

/**
 * GET /api/cron/scrape
 *
 * Called by Vercel Cron every 4 hours (see vercel.json).
 * This endpoint:
 *   1. Verifies the cron secret (CRON_SECRET env var — set in Vercel dashboard)
 *   2. Logs a heartbeat + returns DB stats so you can monitor scraper health
 *
 * NOTE: Actual email scraping happens in the Chrome Extension (LinkedIn is
 * browser-rendered — it cannot be scraped from a backend process).
 * The extension auto-triggers every 4 hours via chrome.alarms and POSTs
 * emails to /api/scraper/bulk. This cron job is a companion health-check
 * and can also re-trigger the extension via a push notification if needed.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // ── 1. Verify cron secret ────────────────────────────────────────────────────
  // Vercel sends Authorization: Bearer <CRON_SECRET> automatically.
  // For local testing, pass ?secret=<CRON_SECRET> in the URL.
  const authHeader = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const isValid =
      authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── 2. Connect and gather stats ──────────────────────────────────────────────
  try {
    await connectDB();

    const admin = await User.findOne({ role: "admin" }).select("email").lean();

    const [total, addedToday, addedThisWeek] = await Promise.all([
      Company.countDocuments({ isActive: true }),
      Company.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      Company.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const stats = {
      ok: true,
      timestamp: new Date().toISOString(),
      admin: admin ? (admin as { email: string }).email : "not found",
      companies: { total, addedToday, addedThisWeek },
      note: "Chrome Extension auto-scrapes LinkedIn every 4 hours via chrome.alarms and pushes emails to /api/scraper/bulk.",
    };

    console.log("[CRON /api/cron/scrape] Heartbeat:", JSON.stringify(stats));

    return NextResponse.json(stats, { status: 200 });
  } catch (err) {
    console.error("[CRON /api/cron/scrape] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
