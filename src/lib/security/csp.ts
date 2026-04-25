const isProduction = process.env.NODE_ENV === "production";

const allowedImageHosts = [
  "books.google.com",
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "*.googleusercontent.com",
];

/** R2/MinIO の公開 URL ホストを CSP img-src に追加する */
function getR2ImageOrigin(): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT;
  if (!publicUrl) return null;
  try {
    const { protocol, hostname, port } = new URL(publicUrl);
    return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
  } catch {
    return null;
  }
}

export function buildCspHeader(nonce: string): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(isProduction ? [] : ["'unsafe-eval'"]),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      ...allowedImageHosts,
      ...(getR2ImageOrigin() ? [getR2ImageOrigin()!] : []),
    ],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}
