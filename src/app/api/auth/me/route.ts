import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * Get current user session
 * Returns the authenticated user's information
 */
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: session.username,
        email: session.email,
        attributes: session.attributes,
      },
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
