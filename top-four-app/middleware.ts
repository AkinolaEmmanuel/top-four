import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Whitelist public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/verify') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/j/') || // invite landing page
    pathname === '/' || // Home might be public or protected, but for now we let it pass to render empty state
    pathname.match(/\.(png|jpg|jpeg|svg|ico)$/) // static assets
  ) {
    return NextResponse.next();
  }

  // Look for the session cookie
  // The local cookie is 'tf.sid', production is '__Host-tf.sid'
  const hasSession = request.cookies.has('tf.sid') || request.cookies.has('__Host-tf.sid');

  if (!hasSession) {
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
