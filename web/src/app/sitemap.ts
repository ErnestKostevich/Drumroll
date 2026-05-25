import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, priority: 1, changeFrequency: "weekly" },
    { url: `${siteUrl}/legal/privacy`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/legal/terms`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/legal/refund`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/w/lumen-ai`, lastModified: now, priority: 0.4 },
  ];
}
