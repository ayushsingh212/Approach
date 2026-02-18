import type {
  Transmission,
  CorporateEntity,
  ChartDataPoint,
  Campaign,
} from "@/types";

export const transmissions: Transmission[] = [
  {
    id: "1",
    recipients: ["Global Logistics Corp.", "+14"],
    recipientCategory: "B2B PRIME DISTRIBUTION",
    subject: "Quarterly Performance Overview & Strategic Roadmap",
    date: "Oct 24, 2023",
    time: "14:32 PM",
    status: "DELIVERED",
    openRate: 98.4,
    avgReadTime: "12s",
    assets: [
      { id: "a1", name: "Q4_Performance_Report.pdf", type: "PDF" },
      { id: "a2", name: "Regional_Data_Set_v2.xlsx", type: "XLS" },
    ],
    preview:
      '"Dear Stakeholders, Please find the comprehensive transmission regarding our operational adjustments for the upcoming fiscal quarter. We have integrated several key performance indicators..."',
    sentVia: "FIBER-LINK 4",
  },
  {
    id: "2",
    recipients: ["Nordic Capital Group"],
    recipientCategory: "DIRECT INVESTMENT BOARD",
    subject: "Confidential: Asset Allocation Adjustment Proposals",
    date: "Oct 23, 2023",
    time: "09:15 AM",
    status: "DELIVERED",
    openRate: 91.2,
    avgReadTime: "8s",
    sentVia: "FIBER-LINK 2",
    preview:
      '"Esteemed Board Members, We present herein the consolidated asset allocation adjustment proposals aligned with our strategic framework..."',
  },
  {
    id: "3",
    recipients: ["Sovereign Tech Systems"],
    recipientCategory: "ENTERPRISE PARTNERS",
    subject: "Security Protocol Update & Compliance Audit",
    date: "Oct 22, 2023",
    time: "16:45 PM",
    status: "PENDING",
    sentVia: "FIBER-LINK 1",
    preview:
      '"Dear Technology Partners, This transmission outlines the forthcoming security protocol updates and compliance audit requirements..."',
  },
  {
    id: "4",
    recipients: ["Apex Ventures"],
    recipientCategory: "PORTFOLIO MANAGEMENT",
    subject: "Annual Stakeholder Assembly: Official Invitation",
    date: "Oct 20, 2023",
    time: "11:00 AM",
    status: "DELIVERED",
    openRate: 95.7,
    avgReadTime: "15s",
    sentVia: "FIBER-LINK 3",
    preview:
      '"Distinguished Stakeholders, You are cordially invited to attend the Annual Stakeholder Assembly scheduled for November 15th..."',
  },
  {
    id: "5",
    recipients: ["Meridian Solutions"],
    recipientCategory: "EXTERNAL RELATIONS",
    subject: "Market Expansion Strategy — Draft v4",
    date: "Oct 19, 2023",
    time: "13:20 PM",
    status: "DELIVERED",
    openRate: 88.3,
    avgReadTime: "22s",
    sentVia: "FIBER-LINK 2",
    preview:
      '"To Our Strategic Partners, Enclosed please find the fourth revision of our market expansion strategy document for your review..."',
  },
];

export const corporateEntities: CorporateEntity[] = [
  {
    id: "1",
    initial: "G",
    name: "Global Logistics Corp.",
    industry: "TRANSPORTATION",
    region: "North America",
    primaryContacts: 12,
    lastInteraction: "OCT 24, 2023",
  },
  {
    id: "2",
    initial: "N",
    name: "Nordic Capital Group",
    industry: "PRIVATE EQUITY",
    region: "Western Europe",
    primaryContacts: 8,
    lastInteraction: "NOV 02, 2023",
  },
  {
    id: "3",
    initial: "S",
    name: "Sovereign Tech Solutions",
    industry: "SOFTWARE ENGINEERING",
    region: "APAC",
    primaryContacts: 45,
    lastInteraction: "OCT 29, 2023",
  },
  {
    id: "4",
    initial: "B",
    name: "Beacon Industrial Trust",
    industry: "REAL ESTATE",
    region: "Global",
    primaryContacts: 5,
    lastInteraction: "OCT 15, 2023",
  },
  {
    id: "5",
    initial: "A",
    name: "Aether Bio-Systems",
    industry: "PHARMACEUTICALS",
    region: "Western Europe",
    primaryContacts: 21,
    lastInteraction: "YESTERDAY",
  },
];

export const engagementTrends: ChartDataPoint[] = [
  { label: "MON", opens: 25, clicks: 8 },
  { label: "TUE", opens: 35, clicks: 12 },
  { label: "WED", opens: 68, clicks: 18 },
  { label: "THU", opens: 82, clicks: 22 },
  { label: "FRI", opens: 55, clicks: 32 },
  { label: "SAT", opens: 72, clicks: 42 },
  { label: "SUN", opens: 90, clicks: 48 },
];

export const hourlyData: ChartDataPoint[] = [
  { label: "00:00", opens: 20, clicks: 5 },
  { label: "03:00", opens: 15, clicks: 4 },
  { label: "06:00", opens: 35, clicks: 10 },
  { label: "09:00", opens: 75, clicks: 22 },
  { label: "12:00", opens: 90, clicks: 28 },
  { label: "15:00", opens: 65, clicks: 35 },
  { label: "18:00", opens: 80, clicks: 45 },
  { label: "21:00", opens: 55, clicks: 38 },
  { label: "23:59", opens: 40, clicks: 25 },
];

export const topCampaigns: Campaign[] = [
  {
    name: "Q4 Strategic Roadmap",
    sentDate: "SENT DEC 12",
    recipients: "4,200 RECIPIENTS",
    openRate: 32.4,
  },
  {
    name: "Annual Compliance Review",
    sentDate: "SENT DEC 08",
    recipients: "12,800 RECIPIENTS",
    openRate: 28.1,
  },
];

export const analyticsTopTransmissions = [
  {
    name: "Q4 Strategic Roadmap - Alpha Entities",
    age: "SENT 2 DAYS AGO",
    recipients: "1,204 RECIPIENTS",
    openRate: 92.4,
    ctr: 18.1,
  },
  {
    name: "Annual Compliance Review",
    age: "SENT 5 DAYS AGO",
    recipients: "12,800 RECIPIENTS",
    openRate: 88.7,
    ctr: 12.3,
  },
];
