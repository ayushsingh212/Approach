import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Approach— Excellence in Communication",
  description: "Precision-engineered bulk mailing architecture for the discerning enterprise.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="./logo.png"  type="image/x-icon" width="20" height="20" />
      </head>
      <body>{children}</body>
    </html>
  );
}
