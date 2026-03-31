import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "@/src/lib/db";
import { decrypt } from "@/src/lib/encrypt";
import User from "@/src/models/UserSchema";
import Company from "@/src/models/CompanySchema";
import EmailLog, { IDeliveryResult } from "@/src/models/EmailSchema";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ─────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse body ─────────────────────────────────────────────────────────
    const body = await req.json();
    const { companyIds, subject, emailBody } = body as {
      companyIds: string[];
      subject: string;
      emailBody: string;
    };

    if (!companyIds?.length || !subject || !emailBody) {
      return NextResponse.json(
        { error: "companyIds, subject, and emailBody are required" },
        { status: 400 }
      );
    }

    // ── 3. Connect DB ─────────────────────────────────────────────────────────
    await connectDB();

    // ── 4. Fetch user with sensitive fields ───────────────────────────────────
    const user = await User.findOne({ email: session.user.email }).select(
      "+googleAppPassword +password"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.googleAppPassword || !user.senderEmail) {
      return NextResponse.json(
        { error: "Sender email or Google App Password not configured" },
        { status: 400 }
      );
    }

    // ── 5. Decrypt Google App Password ────────────────────────────────────────
    let appPassword: string;
    try {
      appPassword = decrypt(user.googleAppPassword);
    } catch {
      return NextResponse.json(
        { error: "Failed to decrypt credentials. Please re-save your settings." },
        { status: 500 }
      );
    }

    // ── 6. Fetch target companies ─────────────────────────────────────────────
    const companies = await Company.find({
      _id: { $in: companyIds },
      isActive: true,
    });

    if (!companies.length) {
      return NextResponse.json(
        { error: "No active companies found for the given IDs" },
        { status: 404 }
      );
    }

    // ── 7. Create Nodemailer transporter ──────────────────────────────────────
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user.senderEmail,
        pass: appPassword,
      },
    });

    // ── 8. Verify transporter (catches wrong credentials early) ───────────────
    try {
      await transporter.verify();
    } catch {
      return NextResponse.json(
        {
          error:
            "Gmail authentication failed. Check your sender email and Google App Password.",
        },
        { status: 400 }
      );
    }

    // ── 9. Send emails to all companies ───────────────────────────────────────
    const settled = await Promise.allSettled(
      companies.map((company) =>
        transporter.sendMail({
          from: `"${user.name}" <${user.senderEmail}>`,
          to: company.email,
          subject: subject,
          html: emailBody,
        })
      )
    );

    // ── 10. Build delivery results ────────────────────────────────────────────
    const deliveryResults: IDeliveryResult[] = companies.map((company, i) => {
      const result = settled[i];
      if (result.status === "fulfilled") {
        return {
          company: company._id,
          companyEmail: company.email,
          companyName: company.name,
          status: "sent",
          messageId: result.value.messageId ?? undefined,
        };
      } else {
        return {
          company: company._id,
          companyEmail: company.email,
          companyName: company.name,
          status: "failed",
          errorMessage:
            result.reason instanceof Error
              ? result.reason.message
              : "Unknown error",
        };
      }
    });

    // ── 11. Save email log ────────────────────────────────────────────────────
    const emailLog = await EmailLog.create({
      sentBy: user._id,
      senderEmail: user.senderEmail,
      subject,
      body: emailBody,
      companies: companies.map((c) => c._id),
      deliveryResults,
      totalTargeted: companies.length,
      // totalSent, totalFailed, status are auto-computed in pre-save hook
    });

    // ── 12. Increment user's email sent count ─────────────────────────────────
    const sentCount = deliveryResults.filter((r) => r.status === "sent").length;
    await User.findByIdAndUpdate(user._id, {
      $inc: { emailsSentCount: sentCount },
    });

    // ── 13. Return result ─────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      summary: {
        totalTargeted: emailLog.totalTargeted,
        totalSent: emailLog.totalSent,
        totalFailed: emailLog.totalFailed,
        status: emailLog.status,
      },
      deliveryResults,
    });

  } catch (error) {
    console.error("[EMAIL SEND ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}