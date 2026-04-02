import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";

// ── GET /api/user ─────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // toJSON auto-strips password and googleAppPassword
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET USER ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}