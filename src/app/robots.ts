import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production";
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: isProd
      ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/auth/", "/account/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${base}/sitemap.xml`,
  };
}
