import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Whitelist public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/verify') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/join') ||
    pathname.startsWith('/j/') || // invite landing page
    pathname.match(/\.(png|jpg|jpeg|svg|ico)$/) // static assets
  ) {
    return NextResponse.next();
  }

  // Look for the session cookie
  // The local cookie is 'tf.sid', production is '__Host-tf.sid'
  const hasSession = request.cookies.has('tf.sid') || request.cookies.has('__Host-tf.sid');

  // If trying to access the root page (which is now sign-in) while logged in, go to home
  if (hasSession && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // If trying to access a protected route without a session, go to root (sign-in)
  if (!hasSession && pathname !== '/') {
    const url = new URL('/', request.url);
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
