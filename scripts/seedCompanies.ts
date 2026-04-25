/**
 * seedCompanies.ts
 * Run with: npx tsx scripts/seedCompanies.ts
 *
 * - Reads MONGODB_URI from .env (no dotenv dep needed)
 * - Auto-finds the first admin user in the DB to use as addedBy
 * - Upserts companies without overwriting existing records
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// ─── Manual .env loader (avoids needing dotenv package) ──────────────────────
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

// ─── Import models ────────────────────────────────────────────────────────────
import Company from "../src/models/CompanySchema";
import User from "../src/models/UserSchema";

// ─── Email list ───────────────────────────────────────────────────────────────
const emails = [
  "info@shivayagency.in",
  "melaniewilde-lane@ctschoolhealth.org",
  "helpdesk@hersecondinnings.com",
  "connect@aviyanarpggroup.com",
  "hr@osso-ai.com",
  "autotiation@gmail.com",
  "hr@beleaftechnologies.com",
  "sejal@utsanova.com",
  "hr@utsanova.com",
  "skillxa.hr@gmail.com",
  "kunal@worthyadvisors.in",
  "sanchit@treasurypro.in",
  "as@azefox.com",
  "kheniharsh7@gmail.com",
  "career@orbisystechnology.com",
  "priyanka@pathlyft.com",
  "hr@galaxyerpsoftware.com",
  "bhumireddyswapna4@gmail.com",
  "hr@nexasoftinfotech.com",
  "prexa810@gmail.com",
  "devi@quantumgandivaai.com",
  "jobrush0@gmail.com",
  "artibhat487@gmail.com",
  "recruiter@ultimez.com",
  "akshaychakraborty472@gmail.com",
];

// ─── Utility: derive company name from email domain ───────────────────────────
function extractCompanyName(email: string): string {
  const domain = email.split("@")[1];       // e.g. utsanova.com
  const namePart = domain.split(".")[0];    // utsanova
  return namePart
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Auto-resolve admin user — no hardcoded ID needed
    const adminUser = await User.findOne({ role: "admin" }).select("_id").lean();
    if (!adminUser) {
      console.error("❌ No admin user found in the database. Create one first.");
      process.exit(1);
    }
    const adminId = adminUser._id as mongoose.Types.ObjectId;
    console.log(`👤 Using admin user: ${adminId}`);

    // Deduplicate emails
    const uniqueEmails = Array.from(new Set(emails.map((e) => e.toLowerCase())));
    console.log(`📋 Processing ${uniqueEmails.length} unique emails...`);

    const operations = uniqueEmails.map((email) => ({
      updateOne: {
        filter: { email },
        update: {
          $setOnInsert: {
            name: extractCompanyName(email),
            email,
            category: ["Other"],      // Valid per COMPANY_CATEGORIES
            addedBy: adminId,         // Required by schema
            isActive: true,
            tags: ["cold-lead"],
          },
        },
        upsert: true,
      },
    }));

    const result = await Company.bulkWrite(operations);

    console.log("\n🚀 Seeding complete!");
    console.log(`   ✅ Inserted (new): ${result.upsertedCount}`);
    console.log(`   ♻️  Matched (already existed): ${result.matchedCount}`);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

seed();
