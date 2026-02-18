# MailBulk B2B — Production-Ready Next.js Frontend

A premium enterprise B2B bulk mailing platform built with Next.js 14, TypeScript, and Tailwind CSS — faithfully implementing all 6 design screens.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS utilities
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Playfair Display (serif/display) + DM Sans (body) + JetBrains Mono (code/labels)

## Screens Implemented

| Route | Screen | Description |
|-------|--------|-------------|
| `/login` | Sign In / Register | Split-panel login with SSO, tabs, gold CTA |
| `/compose` | New Transmission | Recipient tags, rich text toolbar, attachments |
| `/transmissions` | Sent Transmissions | Table + slide-in detail panel, status badges |
| `/analytics` | Performance Analytics | KPI cards, line chart, pie chart, campaign rankings |
| `/contacts` | Corporate Entity Directory | Filterable table with pagination |
| `/dashboard` | Transmission Analytics | KPI cards with donuts, composed bar+line chart, reach data |

## Design System

### Colors
- **Gold**: `#B8973A` — Primary accent (CTAs, active states)
- **Dark**: `#1A1A1A` — Primary dark background/text
- **Dark Sidebar**: `#111111` — Navigation sidebar
- **Surface Border**: `#E8E4DC` — Subtle borders

### Typography
- **Display/Headings**: Playfair Display (serif, italic for hero text)
- **Body/UI**: DM Sans (clean, professional)
- **Labels/Mono**: JetBrains Mono (tracking widths for uppercase labels)

### Custom Utilities
- `.btn-gold` — Gold CTA button
- `.btn-primary` — Dark primary button
- `.btn-outline` — Outlined secondary button
- `.form-input` / `.form-label` — Styled form elements
- `.card` — Standard card container with border
- `.badge-delivered` / `.badge-pending` — Status badges
- `.dark-grid-bg` — Login panel background with golden grid pattern
- `.tab-active` — Active tab with gold underline

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/login`.

## Project Structure

```
mailbulk-b2b/
├── app/
│   ├── login/page.tsx          # Sign In / Register
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with Sidebar
│   │   ├── compose/page.tsx    # New Transmission
│   │   ├── transmissions/page.tsx  # Sent Transmissions
│   │   ├── analytics/page.tsx  # Performance Analytics
│   │   ├── contacts/page.tsx   # Corporate Entity Directory
│   │   └── dashboard/page.tsx  # Transmission Analytics
│   ├── globals.css             # Design tokens + utility classes
│   └── layout.tsx              # Root layout
├── components/
│   └── layout/
│       └── Sidebar.tsx         # Fixed sidebar navigation
├── lib/
│   └── data.ts                 # Mock data for all screens
└── types/
    └── index.ts                # TypeScript types
```
