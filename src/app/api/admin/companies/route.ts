import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import Company from "@/src/models/CompanySchema";
import UserModel from "@/src/models/UserSchema";
import { CompanySchemaValidation } from "@/src/lib/validations";

// ── GET all companies (admin sees inactive too) ───────────────────────────────

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const search   = searchParams.get("search")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const active   = searchParams.get("active"); // "true" | "false" | null (all)
    const skip     = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (active === "true")  filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate("addedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: companies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[ADMIN GET COMPANIES ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST add new company ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = CompanySchemaValidation.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, category } = result.data;

    await connectDB();

    // Fetch admin user for addedBy ref
    const admin = await UserModel.findOne({ email: session.user.email });
    if (!admin) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const company = await Company.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      category,
      addedBy: admin._id,
    });

    return NextResponse.json(
      { message: "Company added successfully", company },
      { status: 201 }
    );
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
    console.error("[ADMIN ADD COMPANY ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}