import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Use a cookie to track demo sessions
  const sessionId = request.cookies.get('demo-session-id')?.value;

  if (!sessionId) {
    let newSessionId;
    try {
      newSessionId = crypto.randomUUID();
    } catch (e) {
      newSessionId = Math.random().toString(36).substring(2, 15);
    }
    
    const response = NextResponse.next();
    response.cookies.set('demo-session-id', newSessionId, {
      httpOnly: false, // Allow client-side access for analytics
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (public icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};
