import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";
import { encrypt } from "@/src/lib/encrypt";
import nodemailer from "nodemailer";

export async function PUT(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderEmail, googleAppPassword } = await req.json();

    if (!senderEmail && !googleAppPassword) {
      return NextResponse.json(
        {
          error: "Provide at least senderEmail or googleAppPassword to update",
        },
        { status: 400 },
      );
    }

    // ── Validate senderEmail ──────────────────────────────────────────────────
    if (senderEmail && !senderEmail.endsWith("@gmail.com")) {
      return NextResponse.json(
        { error: "Sender email must be a Gmail address" },
        { status: 400 },
      );
    }

    // ── Validate App Password format ──────────────────────────────────────────
    let cleanAppPassword: string | undefined;
    if (googleAppPassword) {
      cleanAppPassword = googleAppPassword.replace(/\s/g, "") as string;
      if (cleanAppPassword.length !== 16) {
        return NextResponse.json(
          { error: "Google App Password must be exactly 16 characters" },
          { status: 400 },
        );
      }
    }

    // ── Test credentials with Nodemailer BEFORE saving ────────────────────────
    // We need both senderEmail and appPassword to verify — fetch existing if one is missing
    await connectDB();

    const existingUser = await UserModel.findOne({
      email: session.user.email,
    }).select("+googleAppPassword");

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const emailToTest = senderEmail ?? existingUser.senderEmail;

    // Only verify if credentials are being changed
    if (senderEmail || cleanAppPassword) {
      let passwordToTest: string;

      if (cleanAppPassword) {
        passwordToTest = cleanAppPassword; // use the new one (plain)
      } else {
        // Decrypt the stored one to test with new senderEmail
        const { decrypt } = await import("@/src/lib/encrypt");
        passwordToTest = decrypt(existingUser.googleAppPassword);
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: emailToTest, pass: passwordToTest },
      });

      try {
        await transporter.verify();
      } catch {
        return NextResponse.json(
          {
            error:
              "Gmail verification failed. Please check your sender email and Google App Password.",
          },
          { status: 400 },
        );
      }
    }

    // ── Build update object ───────────────────────────────────────────────────
    const updateData: Record<string, string> = {};
    if (senderEmail) updateData.senderEmail = senderEmail.toLowerCase().trim();
    if (googleAppPassword) {
      const clean = googleAppPassword.replace(/\s/g, "");
      updateData.googleAppPassword = encrypt(clean);
    }
    
    // ── Save ──────────────────────────────────────────────────────────────────
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true },
    );

    return NextResponse.json({
      message: "Credentials updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[UPDATE CREDENTIALS ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
