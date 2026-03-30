export interface Transmission {
  id: string;
  recipients: string[];
  recipientCategory?: string;
  subject: string;
  date: string;
  time: string;
  status: "DELIVERED" | "PENDING" | "FAILED";
  openRate?: number;
  avgReadTime?: string;
  assets?: Asset[];
  preview?: string;
  sentVia?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: "PDF" | "XLS" | "DOC" | "IMG";
}

export interface CorporateEntity {
  id: string;
  initial: string;
  name: string;
  industry: string;
  region: string;
  primaryContacts: number;
  lastInteraction: string;
}

export interface StatCard {
  label: string;
  value: string;
  unit?: string;
  change?: number;
  changeLabel?: string;
}

export interface Campaign {
  name: string;
  sentDate: string;
  recipients: string;
  openRate: number;
}

export interface ChartDataPoint {
  label: string;
  opens: number;
  clicks: number;
}

export interface NavItem {
  icon: string;
  href: string;
  label: string;
}
