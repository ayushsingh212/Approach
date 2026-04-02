import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/src/lib/db";
import EmailLog from "@/src/models/EmailSchema";
import UserModel from "@/src/models/UserSchema";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const log = await EmailLog.findOne({ _id: params.id, sentBy: user._id })
      .populate("companies", "name email category")
      .lean();

    if (!log) return NextResponse.json({ error: "Log not found" }, { status: 404 });

    return NextResponse.json({ data: log });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}