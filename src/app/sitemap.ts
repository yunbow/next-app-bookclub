import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return [
    {
      url: `${base}/`,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
