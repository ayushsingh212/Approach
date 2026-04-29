import { COMPANY_CATEGORIES } from "@/src/models/CompanySchema";

// ─── Types ────────────────────────────────────────────────────────────────────

type CompanyCategory = (typeof COMPANY_CATEGORIES)[number];

// ─── Keyword map ──────────────────────────────────────────────────────────────
// Each category maps to a list of lowercase keywords to search for.

const KEYWORD_MAP: Record<CompanyCategory, string[]> = {
  Technology: [
    "engineer", "developer", "software", "tech", "it", "cto", "product",
    "saas", "ai", "ml", "data", "cloud", "devops", "fullstack", "frontend",
    "backend", "mobile", "cyber", "security", "platform",
  ],
  Finance: [
    "finance", "banking", "investment", "cfo", "accounting", "fintech",
    "capital", "fund", "equity", "wealth", "insurance", "trading", "asset",
    "credit", "audit", "tax",
  ],
  Healthcare: [
    "health", "medical", "pharma", "doctor", "clinic", "hospital", "biotech",
    "wellness", "nursing", "therapy", "dental", "physician", "surgical",
    "diagnostics", "healthcare",
  ],
  Education: [
    "education", "school", "university", "tutor", "learning", "edtech",
    "teacher", "training", "academy", "coaching", "professor", "instructor",
    "curriculum", "college",
  ],
  Marketing: [
    "marketing", "seo", "brand", "advertising", "growth", "cmo",
    "social media", "pr", "content", "digital", "campaign", "influencer",
    "creative", "copywriter", "media buyer",
  ],
  "E-Commerce": [
    "ecommerce", "e-commerce", "shopify", "retail", "store", "shop", "dtc",
    "marketplace", "amazon", "dropship", "merchandising", "d2c",
  ],
  Logistics: [
    "logistics", "supply chain", "shipping", "freight", "delivery",
    "warehouse", "transport", "courier", "fleet", "procurement", "inventory",
  ],
  Media: [
    "media", "journalist", "publisher", "news", "podcast", "film", "studio",
    "production", "broadcasting", "editor", "reporter", "videographer",
    "photography", "entertainment",
  ],
  "Real Estate": [
    "real estate", "property", "realtor", "construction", "housing",
    "architecture", "interior design", "facilities", "leasing", "mortgage",
  ],
  Manufacturing: [
    "manufacturing", "factory", "industrial", "operations", "plant",
    "production", "assembly", "fabrication", "engineering", "quality control",
  ],
  Consulting: [
    "consulting", "consultant", "advisor", "strategy", "management",
    "partner", "analyst", "advisory", "business development", "solutions",
  ],
  Other: [], // fallback — never matched via keywords
};

// ─── inferCategory ────────────────────────────────────────────────────────────

/**
 * Maps job title and/or company name keywords to one or more COMPANY_CATEGORIES.
 * Pure function — no DB calls, no side effects.
 *
 * @returns An array of matched categories. Falls back to ["Other"] if nothing matches.
 */
export function inferCategory(
  jobTitle: string | null,
  companyName: string | null,
): CompanyCategory[] {
  // Build a single lowercase haystack from both inputs
  const haystack = [jobTitle, companyName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!haystack.trim()) return ["Other"];

  const matched: CompanyCategory[] = [];

  for (const [category, keywords] of Object.entries(KEYWORD_MAP) as [
    CompanyCategory,
    string[],
  ][]) {
    if (category === "Other") continue; // handled as fallback
    if (keywords.some((kw) => haystack.includes(kw))) {
      matched.push(category);
    }
  }

  return matched.length > 0 ? matched : ["Other"];
}
