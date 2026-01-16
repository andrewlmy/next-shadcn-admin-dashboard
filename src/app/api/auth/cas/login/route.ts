import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Get environment configuration
  const env = process.env.ENV || process.env.NODE_ENV || 'development';
  const casServerUrl = (env === 'dev' || env === 'test')
    ? 'http://test-sso.iqiyi.com/cas/login'
    : 'https://sso.qiyi.com/cas/login';
  
  // Get the service URL (where CAS should redirect after login)
  const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/dashboard';
  const baseUrl = request.nextUrl.origin;
  
  // Service URL must include cb=1 for CAS callback flow
  const callbackUrl = `${baseUrl}/api/auth/cas/callback?cb=1&returnUrl=${encodeURIComponent(returnUrl)}`;
  const serviceUrl = encodeURIComponent(callbackUrl);
  
  // Construct CAS login URL
  const casLoginUrl = `${casServerUrl}?service=${serviceUrl}`;
  
  // Debug logging
  console.log('CAS Login - Service URL sent to CAS:', callbackUrl);
  console.log('CAS Login - Encoded service URL:', serviceUrl);
  console.log('CAS Login - Full CAS URL:', casLoginUrl);
  
  // Redirect to CAS server
  return NextResponse.redirect(casLoginUrl);
}
