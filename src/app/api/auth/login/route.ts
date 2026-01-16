import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Fallback login route - redirects to the nested cas/login route
 * This exists in case Turbopack has issues with deeply nested routes
 */
export async function GET(request: NextRequest) {
  const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/dashboard';
  const redirectUrl = new URL('/api/auth/cas/login', request.url);
  redirectUrl.searchParams.set('returnUrl', returnUrl);
  return NextResponse.redirect(redirectUrl);
}
