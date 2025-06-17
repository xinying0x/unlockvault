import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '../lib/auth'

// Rate limiting configuration
const RATE_LIMIT = 100 // requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

// Store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function apiMiddleware(request: NextRequest) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Check rate limit
  const now = Date.now()
  const rateLimit = rateLimitStore.get(ip)
  
  if (rateLimit) {
    if (now > rateLimit.resetTime) {
      // Reset if window has passed
      rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    } else if (rateLimit.count >= RATE_LIMIT) {
      // Rate limit exceeded
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      // Increment count
      rateLimit.count++
    }
  } else {
    // First request
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
  }

  // Check authentication for protected routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const session = request.cookies.get('session')
    if (!session || !verifyToken(session.value)) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )

  return response
} 