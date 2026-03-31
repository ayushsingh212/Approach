import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/Providers";
export const metadata: Metadata = {
  title: "Approach— Excellence in Communication",
  description:
    "Precision-engineered bulk mailing architecture for the discerning enterprise.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
            <div className="flex">
              <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto">{children}</div>
              </div>
            </div>
        </Providers>
      </body>
    </html>
  );
}
