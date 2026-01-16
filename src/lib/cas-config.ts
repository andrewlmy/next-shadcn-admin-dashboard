/**
 * CAS (Central Authentication Service) Configuration
 * Determines CAS server URL and redirect URL based on environment
 */

export function getCasConfig() {
  const env = process.env.NODE_ENV || 'development';
  const customEnv = process.env.ENV || env; // Allow override via ENV var

  if (customEnv === 'dev' || customEnv === 'test') {
    return {
      casServerUrl: 'http://test-sso.iqiyi.com/cas/login',
      redirectUrl: process.env.CAS_REDIRECT_URL,
    };
  } else {
    return {
      casServerUrl: 'https://sso.qiyi.com/cas/login',
      redirectUrl: process.env.CAS_REDIRECT_URL,
    };
  }
}

export function getCasServiceUrl(requestUrl?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  (process.env.VERCEL_URL 
                    ? `https://${process.env.VERCEL_URL}`
                    : 'http://localhost:3000');
  
  // Use provided requestUrl or construct callback URL
  const serviceUrl = requestUrl || `${baseUrl}/api/auth/cas/callback`;
  
  return encodeURIComponent(serviceUrl);
}
