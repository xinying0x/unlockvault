import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode('supersecretkey');

export async function middleware(request: NextRequest) {
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
  matcher: '/admin-xyz123/:path*',
}