import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting store (Note: In a multi-region/serverless deployment,
// this state isn't shared globally. For true global rate limiting, use Redis/Upstash).
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Allow 100 requests per minute per IP

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();

  const rateLimitData = rateLimitMap.get(ip);

  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    rateLimitData.count++;
    if (rateLimitData.count > MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Next.js Response
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // Basic Content Security Policy (CSP)
  // Adjusted to allow inline scripts for Next.js functionality
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; connect-src 'self' http://localhost:4000 https://smart24-backend.onrender.com https://api.stripe.com;"
  );

  return response;
}

export const config = {
  matcher: [
    // Apply middleware to all routes except Next.js internals, static files, and images
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
};
