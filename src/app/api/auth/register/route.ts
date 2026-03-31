import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";
import { encrypt } from "@/src/lib/encrypt";
import { verifyGmailCredentials } from "@/src/lib/verifyGmailCredentials";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, senderEmail, googleAppPassword } =
      await req.json();

    // ── Validate required fields ──────────────────────────────────────────────
    if (!name || !email || !password || !senderEmail || !googleAppPassword) {
      return NextResponse.json(
        { error: "All fields are required: name, email, password, senderEmail, googleAppPassword" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!senderEmail.endsWith("@gmail.com")) {
      return NextResponse.json(
        { error: "Sender email must be a Gmail address" },
        { status: 400 }
      );
    }

    // Google App Password is always 16 chars (no spaces)
    const cleanAppPassword = googleAppPassword.replace(/\s/g, "");
    if (cleanAppPassword.length !== 16) {
      return NextResponse.json(
        { error: "Google App Password must be exactly 16 characters" },
        { status: 400 }
      );
    }

    const gmailCheck = await verifyGmailCredentials(senderEmail, cleanAppPassword);
    if (!gmailCheck.valid) {
      return NextResponse.json({ error: gmailCheck.error }, { status: 400 });
    }

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

    // ── Encrypt Google App Password before saving ─────────────────────────────
    const encryptedAppPassword = encrypt(cleanAppPassword);

    // ── Create user (password hashed by pre-save hook) ────────────────────────
    const user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,                        // hashed in pre-save hook
      senderEmail: senderEmail.toLowerCase().trim(),
      googleAppPassword: encryptedAppPassword,
    });

    // toJSON strips password and googleAppPassword automatically
    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (e: any) => e.message
      );
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }

    // Duplicate key (race condition)
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