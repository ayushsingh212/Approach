import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import EmailLog from "@/src/models/EmailSchema";
import Company from "@/src/models/CompanySchema";
import { sendEmailWithLinks } from "@/src/lib/nodemailer-supabase";
import { createClient } from "@supabase/supabase-js";
import { connectDB } from "@/src/lib/db";
import UserModel from "@/src/models/UserSchema";
import { decrypt } from "@/src/lib/encrypt";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf"];

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // ─── SESSION CHECK ─────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ─── FETCH USER GMAIL CREDENTIALS ──────────────────────────────────────
    await connectDB();
    const user = await UserModel.findOne({ email: session.user.email })
      .select("+googleAppPassword");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.senderEmail || !user.googleAppPassword) {
      return NextResponse.json(
        { error: "Gmail credentials not configured. Please update your profile." },
        { status: 400 }
      );
    }

    const gmailUser = user.senderEmail;
    const gmailPass = decrypt(user.googleAppPassword);

    // ─── PARSE FormData ────────────────────────────────────────────────────
    const formData = await req.formData();
    const subject = formData.get("subject") as string;
    const emailBody = formData.get("emailBody") as string;
    const companyIds = formData.getAll("companyIds") as string[];
    const fileEntries = formData.getAll("attachments") as File[];

    // ─── VALIDATION ────────────────────────────────────────────────────────
    if (!subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!emailBody?.trim()) {
      return NextResponse.json({ error: "Email body is required" }, { status: 400 });
    }
    if (!companyIds || companyIds.length === 0) {
      return NextResponse.json({ error: "At least one company is required" }, { status: 400 });
    }

    // ─── UPLOAD PDFs TO SUPABASE & GET SIGNED URLS ─────────────────────────
    const attachmentUrls: Array<{ filename: string; url: string }> = [];

    for (const file of fileEntries) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `File ${file.name} is not a PDF` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds 5MB limit` }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("email-attachments")
        .upload(uniqueFilename, buffer, {
          contentType: "application/pdf",
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("❌ Supabase upload error:", uploadError);
        return NextResponse.json({ error: `Failed to upload ${file.name}` }, { status: 500 });
      }

      const { data: signedUrlData, error: signUrlError } = await supabase.storage
        .from("email-attachments")
        .createSignedUrl(uniqueFilename, 7 * 24 * 60 * 60);

      if (signUrlError) {
        console.error("❌ Supabase signed URL error:", signUrlError);
        return NextResponse.json({ error: `Failed to generate download link for ${file.name}` }, { status: 500 });
      }

      attachmentUrls.push({ filename: file.name, url: signedUrlData.signedUrl });
    }

    // ─── FETCH COMPANIES ───────────────────────────────────────────────────
    const companies = await Company.find({ _id: { $in: companyIds } }).lean();

    if (companies.length === 0) {
      return NextResponse.json({ error: "No valid companies found" }, { status: 404 });
    }

    // ─── SEND EMAILS ───────────────────────────────────────────────────────
    const deliveryResults = await Promise.allSettled(
      companies.map(async (company) => {
        try {
          const messageId = await sendEmailWithLinks({
            to: company.email,
            subject: subject.trim(),
            html: emailBody.trim(),
            attachmentUrls,
            companyName: company.name,
            gmailUser,
            gmailPass,
          });

          return {
            company: company._id,
            companyEmail: company.email,
            companyName: company.name,
            status: "sent" as const,
            messageId,
          };
        } catch (error: any) {
          return {
            company: company._id,
            companyEmail: company.email,
            companyName: company.name,
            status: "failed" as const,
            errorMessage: error.message || "Unknown error",
          };
        }
      })
    );

    // ─── PROCESS RESULTS ───────────────────────────────────────────────────
    const results = deliveryResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    const totalSent = results.filter((r) => r.status === "sent").length;
    const totalFailed = results.filter((r) => r.status === "failed").length;

    let status: "completed" | "partial" | "all_failed";
    if (totalFailed === 0) status = "completed";
    else if (totalSent === 0) status = "all_failed";
    else status = "partial";

    // ─── SAVE EMAIL LOG ────────────────────────────────────────────────────
    await EmailLog.create({
      sentBy: session.user.id,
      senderEmail: gmailUser,
      subject: subject.trim(),
      body: emailBody.trim(),
      companies: companyIds,
      deliveryResults: results,
      totalTargeted: companies.length,
      totalSent,
      totalFailed,
      status,
      attachmentUrls,
      sentAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Emails sent successfully with download links",
      summary: { totalTargeted: companies.length, totalSent, totalFailed, status },
      deliveryResults: results,
    });
  } catch (error: any) {
    console.error("❌ Email send error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}