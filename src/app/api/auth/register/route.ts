import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";
import { encrypt } from "@/src/lib/encrypt";
import { verifyGmailCredentials } from "@/src/lib/verifyGmailCredentials";
import { rateLimiter, rateLimitResponse } from "@/src/lib/rateLimiter";
import { RegisterSchema } from "@/src/lib/validations";

export async function POST(req: NextRequest) {
  try {

    // ── 1. Rate Limiting ──────────────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const { success, retryAfter } = rateLimiter(`register-${ip}`, {
      limit: 5,         // Max 5 attempts
      windowMs: 600000, // per 10 minutes
    });

    if (!success) {
      return rateLimitResponse(retryAfter);
    }

    // ── 2. Parse and Validate Body ────────────────────────────────────────────
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password} = result.data;

    await connectDB();

    // ── Check duplicate ───────────────────────────────────────────────────────
    const existing = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Create user (password hashed by pre-save hook) ────────────────────────
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,                        
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (e: any) => e.message
      );
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    console.error("[REGISTER ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}