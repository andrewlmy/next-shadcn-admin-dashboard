import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Get environment configuration
  const env = process.env.ENV || process.env.NODE_ENV || 'development';
  const casServerUrl = (env === 'dev' || env === 'test')
    ? 'http://test-sso.iqiyi.com/cas/login'
    : 'https://sso.qiyi.com/cas/login';
  
  // Get the service URL (where CAS should redirect after login)
  // Normalize "/" to "/dashboard" so post-login always lands on dashboard
  let returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/dashboard';
  if (returnUrl === '/' || returnUrl === '') returnUrl = '/dashboard';
  
  // Use NEXT_PUBLIC_APP_URL or default ops3 (do not use localhost for CAS)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://ops3-19ee08662.qiyi.virtual:3000';
  
  // Service URL must include cb=1 for CAS callback flow
  const callbackUrl = `${baseUrl}/api/auth/cas/callback?cb=1&returnUrl=${encodeURIComponent(returnUrl)}`;
  const serviceUrl = encodeURIComponent(callbackUrl);
  
  // Construct CAS login URL
  const casLoginUrl = `${casServerUrl}?service=${serviceUrl}`;
  
  return NextResponse.redirect(casLoginUrl);
}
