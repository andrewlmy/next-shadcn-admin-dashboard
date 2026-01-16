import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';
import { getCasConfig } from '@/lib/cas-config';

/**
 * Logout Route
 * Clears session and redirects to CAS logout
 */
export async function GET(request: Request) {
  try {
    // Clear session
    await clearSession();

    // Redirect to CAS logout
    const { casServerUrl } = getCasConfig();
    const logoutUrl = casServerUrl.replace('/login', '/logout');
    
    const url = new URL(request.url);
    const serviceUrl = encodeURIComponent(`${url.origin}/dashboard`);
    const casLogoutUrl = `${logoutUrl}?service=${serviceUrl}`;

    return NextResponse.redirect(casLogoutUrl);
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, clear session and redirect to dashboard
    await clearSession();
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
