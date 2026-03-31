import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";
import EmailLog from "@/src/models/EmailSchema";

export async function GET(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Query params ──────────────────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
    const statusFilter = searchParams.get("status"); // completed | partial | all_failed
    const skip = (page - 1) * limit;

    await connectDB();

    // ── Find user ─────────────────────────────────────────────────────────────
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Build filter ──────────────────────────────────────────────────────────
    const filter: Record<string, any> = { sentBy: user._id };
    if (statusFilter && ["completed", "partial", "all_failed"].includes(statusFilter)) {
      filter.status = statusFilter;
    }

    // ── Fetch logs with pagination ─────────────────────────────────────────────
    const [logs, total] = await Promise.all([
      EmailLog.find(filter)
        .sort({ sentAt: -1 })             // newest first
        .skip(skip)
        .limit(limit)
        .populate("companies", "name email category") // attach company info
        .lean(),                          // plain JS object, faster
      EmailLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: logs,
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
    console.error("[GET SENT MAILS ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}