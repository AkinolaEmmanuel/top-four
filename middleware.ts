import { NextResponse, type NextRequest } from "next/server";

// Auth-gating intentionally lives in route layouts/pages (e.g. app/(game)/layout.tsx,
// app/onboarding/page.tsx), not here — see those for the actual redirect-if-no-session checks.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - common static file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
