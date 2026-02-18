import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MailBulk B2B — Excellence in Communication",
  description: "Precision-engineered bulk mailing architecture for the discerning enterprise.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
