/**
 * CAS (Central Authentication Service) Configuration
 * Determines CAS server URL and redirect URL based on environment
 *
 * Hosts:
 * - ops3-19ee08662.qiyi.virtual: dev & test
 * - ops4-1553aa9d7.qiyi.virtual: production
 */

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const env = process.env.ENV || process.env.NODE_ENV || 'development';
  return (env === 'dev' || env === 'test')
    ? 'http://ops3-19ee08662.qiyi.virtual:3000'
    : 'http://ops4-1553aa9d7.qiyi.virtual:3000';
}

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
  const baseUrl = getAppBaseUrl();
  
  // Use provided requestUrl or construct callback URL
  const serviceUrl = requestUrl || `${baseUrl}/api/auth/cas/callback`;
  
  return encodeURIComponent(serviceUrl);
}
