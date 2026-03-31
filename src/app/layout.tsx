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
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
