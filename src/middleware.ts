import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSanctionedCountry } from "@/lib/security/sanctioned-countries";
import { isAdminIpAllowed } from "@/lib/security/admin-ip-restriction";
import { buildCspHeader } from "@/lib/security/csp";

function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${randomPart}`;
}

const protectedRoutes = [
  "/dashboard",
  "/books",
  "/clubs",
  "/events",
  "/profile",
  "/users",
  "/settings",
  "/search",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = req.headers.get("x-request-id") || generateRequestId();

  // 1. Client IP
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  // 2. Sanctioned country check
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "";

  if (isSanctionedCountry(country)) {
    return new NextResponse("Access denied", { status: 403 });
  }

  // 3. Admin IP restriction
  if (pathname.startsWith("/admin") && !isAdminIpAllowed(clientIp)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 4. Maintenance mode
  if (
    process.env.MAINTENANCE_MODE === "true" &&
    pathname !== "/maintenance" &&
    !isAdminIpAllowed(clientIp)
  ) {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }

  // 5. Protected route authentication check
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isLoggedIn = !!req.cookies.get("authjs.session-token")?.value ||
    !!req.cookies.get("__Secure-authjs.session-token")?.value;

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 6. Redirect authenticated users from login page
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 7. CSP nonce generation
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = buildCspHeader(nonce);

  // 8. Set response headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-url", req.url);

  if (country) {
    requestHeaders.set("x-user-country", country);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
