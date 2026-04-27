import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import SentEmail from "@/src/models/SentEmailSchema";
import mongoose from "mongoose";

// ─── GET /api/sent-emails ─────────────────────────────────────────────────────
// Returns string[] of companyIds the current user has already emailed.
// Called once on page mount — never per-card.

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const records = await SentEmail.find(
      { sentBy: new mongoose.Types.ObjectId(session.user.id) },
      { company: 1, _id: 0 }, // project only the company field
    ).lean();

    const companyIds = records.map((r) => r.company.toString());

    return NextResponse.json({ companyIds }, { status: 200 });
  } catch (error: any) {
    console.error("❌ GET /api/sent-emails error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── POST /api/sent-emails ────────────────────────────────────────────────────
// Body: { companyId: string }
// Upserts a SentEmail record — safe to call multiple times (idempotent).

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyId } = body as { companyId?: string };

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json(
        { error: "Valid companyId is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // findOneAndUpdate with upsert — never throws a duplicate key error
    await SentEmail.findOneAndUpdate(
      {
        sentBy:  new mongoose.Types.ObjectId(session.user.id),
        company: new mongoose.Types.ObjectId(companyId),
      },
      { $setOnInsert: { sentAt: new Date() } },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ POST /api/sent-emails error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
