/**
 * Session management utilities
 * Uses cookies to store session information
 */

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'cas_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export interface CasSession {
  username: string;
  email?: string;
  attributes?: Record<string, string | string[]>;
  ticket?: string;
}

export async function getSession(): Promise<CasSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as CasSession;
  } catch {
    return null;
  }
}

export async function setSession(session: CasSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null && !!session.username;
}
