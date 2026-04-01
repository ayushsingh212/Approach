// types/company.ts
export interface Company {
  id: string;
  name: string;
  category: CompanyCategory;
  selected: boolean;
}

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

  