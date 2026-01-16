import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setSession } from '@/lib/session';

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
    const returnUrl = url.searchParams.get('returnUrl') || '/dashboard';

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
      // Construct service URL (must EXACTLY match the one sent to CAS during login)
      // Use the current callback URL but remove the ticket parameter
      // CAS may have decoded some parameters, so we use what CAS redirected to
      const serviceUrlForValidation = new URL(url);
      serviceUrlForValidation.searchParams.delete('ticket');
      
      // The service URL should match what was sent to CAS login
      // Reconstruct it to ensure exact match (with cb=1 and returnUrl)
      const reconstructedServiceUrl = `${url.origin}${url.pathname}?cb=1&returnUrl=${encodeURIComponent(returnUrl)}`;
      const serviceUrl = encodeURIComponent(reconstructedServiceUrl);
      const validateUrl = `${casBaseUrl}/cas/serviceValidate?ticket=${ticket}&service=${serviceUrl}`;

      console.log('Callback URL from CAS:', url.toString());
      console.log('Reconstructed service URL for validation:', reconstructedServiceUrl);
      console.log('Encoded service URL:', serviceUrl);
      console.log('Validating ticket with CAS:', validateUrl);

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

      // Create session
      await setSession({
        username,
        attributes,
        ticket: ticket || undefined,
      });

      // Redirect to the original destination or dashboard
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }

    // No ticket - authentication failed or was cancelled
    console.log('No ticket in callback. URL params:', Object.fromEntries(url.searchParams.entries()));
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  } catch (error) {
    console.error('CAS callback error:', error);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}
