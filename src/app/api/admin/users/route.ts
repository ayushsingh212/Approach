import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const search = searchParams.get("search")?.trim() ?? "";
    const role   = searchParams.get("role"); // "user" | "admin" | null
    const skip   = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role === "user" || role === "admin") {
      filter.role = role;
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("name email role senderEmail isVerified emailsSentCount createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: users,
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
    console.error("[ADMIN GET USERS ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH /api/admin/users → toggle user role ─────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const { userId, role } = await req.json();

    if (!userId || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "userId and role ('user' | 'admin') are required" },
        { status: 400 }
      );
    }

    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    ).select("name email role");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User role updated", user: updated });
  } catch (error) {
    console.error("[ADMIN UPDATE ROLE ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}