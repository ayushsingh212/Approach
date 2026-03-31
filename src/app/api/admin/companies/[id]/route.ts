import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Company from "@/src/models/CompanySchema";
import mongoose from "mongoose";

type Params = { params: { id: string } };

// ── Validate ObjectId helper ──────────────────────────────────────────────────

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ── GET single company ────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  if (!isValidId(params.id)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const company = await Company.findById(params.id).populate("addedBy", "name email");
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json({ company });
  } catch (error) {
    console.error("[ADMIN GET COMPANY ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PUT edit company ──────────────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isValidId(params.id)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    await connectDB();

    const body = await req.json();
    const allowedFields = [
      "name", "email", "category", "website",
      "description", "location", "tags", "isActive",
    ];

    // Only pick allowed fields to prevent mass assignment
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Lowercase email if being updated
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }

    const updated = await Company.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Company updated", company: updated });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A company with this email already exists" },
        { status: 409 }
      );
    }
    console.error("[ADMIN EDIT COMPANY ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE soft-delete company ────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!isValidId(params.id)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    await connectDB();

    const company = await Company.findByIdAndUpdate(
      params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Company deactivated (soft deleted)",
      company,
    });
  } catch (error) {
    console.error("[ADMIN DELETE COMPANY ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}