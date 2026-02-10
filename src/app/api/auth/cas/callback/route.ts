import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'cas_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * CAS Callback Route
 * Handles the redirect from CAS server after authentication
 * Validates the ticket and creates a session
 * 
 * Flow:
 * 1. First redirect: CAS redirects here with ticket parameter
 * 2. Extract ticket and validate with CAS serviceValidate endpoint
 * 3. Create session and redirect to original destination
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const cb = url.searchParams.get('cb');
    const ticket = url.searchParams.get('ticket');
    // Normalize "/" to "/dashboard" so post-login always lands on dashboard
    let returnUrl = url.searchParams.get('returnUrl') || '/dashboard';
    if (returnUrl === '/' || returnUrl === '') returnUrl = '/dashboard';

    // Debug logging
    console.log('CAS Callback received:', {
      fullUrl: url.toString(),
      cb,
      ticket: ticket ? 'present' : 'missing',
      returnUrl,
      searchParams: Object.fromEntries(url.searchParams.entries()),
    });

    // Get environment configuration
    const env = process.env.ENV || process.env.NODE_ENV || 'development';
    const casBaseUrl = (env === 'dev' || env === 'test')
      ? 'http://test-sso.iqiyi.com'
      : 'https://sso.qiyi.com';

    // CAS might redirect without cb=1 first, then with ticket
    // Handle both cases: with cb=1 and ticket, or just ticket
    if (ticket) {
      // Service URL for validation must EXACTLY match the one sent to CAS at login.
      // 1) Use same origin as login (NEXT_PUBLIC_APP_URL or default ops3), not request origin.
      // 2) Use exact query string from callback (without ticket), same returnUrl/cb as CAS has.
      const origin = process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
        : 'http://ops3-19ee08662.qiyi.virtual:3000';
      const params = new URLSearchParams(url.searchParams);
      params.delete('ticket');
      const serviceUrlForValidation = `${origin}${url.pathname}?${params.toString()}`;
      const serviceUrl = encodeURIComponent(serviceUrlForValidation);
      const validateUrl = `${casBaseUrl}/cas/serviceValidate?ticket=${ticket}&service=${serviceUrl}`;

      // Fetch CAS validation response
      const validateResponse = await fetch(validateUrl);
      const validateText = await validateResponse.text();

      console.log('CAS validation response:', validateText.substring(0, 500));

      // Parse CAS XML response
      const usernameMatch = validateText.match(/<cas:user>(.*?)<\/cas:user>/);
      
      if (!usernameMatch) {
        // Ticket validation failed
        console.error('CAS ticket validation failed. Full response:', validateText);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      const username = usernameMatch[1];

      // Extract additional attributes if present
      const attributes: Record<string, string | string[]> = {};
      const attributeMatches = validateText.matchAll(/<cas:(\w+)>(.*?)<\/cas:\1>/g);
      for (const match of attributeMatches) {
        const key = match[1];
        if (key !== 'user' && key !== 'authenticationSuccess' && key !== 'authenticationFailure') {
          attributes[key] = match[2];
        }
      }

      // Build redirect response and set session cookie ON the response
      // (cookies().set() does not attach to NextResponse.redirect() in Route Handlers)
      const redirectResponse = NextResponse.redirect(new URL(returnUrl, request.url));
      const sessionPayload = JSON.stringify({
        username,
        attributes,
        ticket: ticket || undefined,
      });
      redirectResponse.cookies.set(SESSION_COOKIE_NAME, sessionPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });
      return redirectResponse;
    }

    // No ticket - authentication failed or was cancelled
    console.log('No ticket in callback. URL params:', Object.fromEntries(url.searchParams.entries()));
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  } catch (error) {
    console.error('CAS callback error:', error);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}
