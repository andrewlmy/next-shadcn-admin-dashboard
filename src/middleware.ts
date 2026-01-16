import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect routes
 * Checks authentication for protected routes and redirects to CAS login if needed
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/auth', // All auth API routes
    '/unauthorized',
    '/auth', // Existing auth demo pages
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  // Get session from cookies (middleware can access cookies directly)
  const sessionCookie = request.cookies.get('cas_session');
  
  if (!sessionCookie?.value) {
    // No session, redirect to CAS login
    // Try the nested path first, fallback to simpler path if needed
    const loginUrl = new URL('/api/auth/cas/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session cookie has valid JSON
  try {
    JSON.parse(sessionCookie.value);
    // Session exists and is valid, allow request
    return NextResponse.next();
  } catch {
    // Invalid session cookie, redirect to login
    const loginUrl = new URL('/api/auth/cas/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
