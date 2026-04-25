import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

/** R2_PUBLIC_URL または R2_ENDPOINT から Next.js remotePattern を生成する */
function buildR2RemotePatterns(): { protocol: "http" | "https"; hostname: string; port?: string }[] {
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT;
  if (!publicUrl) return [];
  try {
    const { protocol, hostname, port } = new URL(publicUrl);
    const proto = protocol.replace(":", "") as "http" | "https";
    return [port ? { protocol: proto, hostname, port } : { protocol: proto, hostname }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "books.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      ...buildR2RemotePatterns(),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default withBundleAnalyzer(nextConfig);
