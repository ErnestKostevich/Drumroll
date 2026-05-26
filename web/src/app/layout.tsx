import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CookieNotice } from "@/components/CookieNotice";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Drumroll — Beautiful waitlists for AI startups",
    template: "%s · Drumroll",
  },
  description:
    "AI-generated copy. Viral referrals. Real analytics. Launch a waitlist your founders won't be embarrassed to share — live in 60 seconds.",
  keywords: [
    "waitlist",
    "AI startup",
    "landing page",
    "viral marketing",
    "referral",
    "indie hacker",
  ],
  authors: [{ name: "Drumroll" }],
  openGraph: {
    title: "Drumroll — Beautiful waitlists for AI startups",
    description:
      "AI-generated copy. Viral referrals. Real analytics. Live in 60 seconds.",
    type: "website",
    siteName: "Drumroll",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drumroll — Beautiful waitlists for AI startups",
    description:
      "AI-generated copy. Viral referrals. Real analytics. Live in 60 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <CookieNotice />
      </body>
    </html>
  );
}
