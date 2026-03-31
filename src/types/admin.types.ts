// ─── Company ──────────────────────────────────────────────────────────────────

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

export interface ICompany {
  _id: string;
  name: string;
  email: string;
  category: CompanyCategory;
  website?: string;
  description?: string;
  location?: string;
  addedBy: { _id: string; name: string; email: string } | string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Admin User view ──────────────────────────────────────────────────────────

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

export interface AddCompanyPayload {
  name: string;
  email: string;
  category: CompanyCategory;
  website?: string;
  description?: string;
  location?: string;
  tags?: string[];
}

export interface UpdateCompanyPayload {
  name?: string;
  email?: string;
  category?: CompanyCategory;
  website?: string;
  description?: string;
  location?: string;
  tags?: string[];
  isActive?: boolean;
}

// ─── Filter shapes ────────────────────────────────────────────────────────────

export interface CompanyFilters {
  search?: string;
  category?: CompanyCategory | "";
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