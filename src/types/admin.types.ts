// ─── Company Category ─────────────────────────────────────────────────────────

export type CompanyCategory =
  | "Technology"
  | "Finance"
  | "Healthcare"
  | "Education"
  | "Marketing"
  | "E-Commerce"
  | "Logistics"
  | "Media"
  | "Real Estate"
  | "Manufacturing"
  | "Consulting"
  | "Other";

export const COMPANY_CATEGORIES: CompanyCategory[] = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "E-Commerce",
  "Logistics",
  "Media",
  "Real Estate",
  "Manufacturing",
  "Consulting",
  "Other",
];

// ─── Company ──────────────────────────────────────────────────────────────────

export interface ICompany {
  _id: string;
  name: string;
  email: string;
  category: CompanyCategory[];  // ✅ Array now!
  website?: string;
  description?: string;
  location?: string;
  addedBy: { _id: string; name: string; email: string } | string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Admin User ───────────────────────────────────────────────────────────────

export interface IAdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  senderEmail: string;
  isVerified: boolean;
  emailsSentCount: number;
  createdAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ─── Company Payloads ─────────────────────────────────────────────────────────

/**
 * AddCompanyPayload - For creating new companies
 * ✅ category is always an array (never empty string)
 */
export interface AddCompanyPayload {
  name: string;
  email: string;
  category: CompanyCategory[];  // ✅ Array of categories
  website?: string;
  description?: string;
  location?: string;
  tags?: string[];
}

/**
 * UpdateCompanyPayload - For partial updates
 * ✅ category is optional array
 */
export interface UpdateCompanyPayload {
  name?: string;
  email?: string;
  category?: CompanyCategory[];  // ✅ Optional array
  website?: string;
  description?: string;
  location?: string;
  tags?: string[];
  isActive?: boolean;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

/**
 * CompanyFilters - For filtering companies list
 * ✅ category is single string for filtering (filter by one category)
 *    or empty string for no filter
 */
export interface CompanyFilters {
  search?: string;
  category?: CompanyCategory | "";  // ✅ Single category for filtering
  active?: "true" | "false" | "";
  page?: number;
  limit?: number;
}

export interface UserFilters {
  search?: string;
  role?: "user" | "admin" | "";
  page?: number;
  limit?: number;
}