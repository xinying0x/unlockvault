import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretkey');

export async function proxy(request: NextRequest) {
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    return response;
  }

  // Admin authentication
  if (
    request.nextUrl.pathname.startsWith('/admin-xyz123') &&
    request.nextUrl.pathname !== '/admin-xyz123/login'
  ) {
    const session = request.cookies.get('auth-token');
    let payload = null;
    if (session) {
      try {
        const { payload: verified } = await jwtVerify(session.value, JWT_SECRET);
        payload = verified;
      } catch (e) {
        payload = null;
      }
    }
    if (!session || !payload) {
      return NextResponse.redirect(new URL('/admin-xyz123/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin-xyz123/:path*'],
}