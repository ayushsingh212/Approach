import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";
import { z } from "zod";
import { rateLimiter, rateLimitResponse } from "@/src/lib/rateLimiter";

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
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success, retryAfter } = rateLimiter(`admin-user-patch-${ip}`, {
      limit: 20,         // 20 updates
      windowMs: 60000,   // per minute
    });

    if (!success) {
      return rateLimitResponse(retryAfter);
    }

    // ── 2. Parse and Validate ─────────────────────────────────────────────────
    const body = await req.json();
    const updateSchema = z.object({
      userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID format"),
      role: z.enum(["user", "admin"]),
    });

    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, role } = result.data;

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