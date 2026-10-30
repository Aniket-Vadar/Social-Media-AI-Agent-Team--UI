import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkRateLimit } from '@/lib/security/rateLimit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, favicon, and image paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/avatars') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Extract Client IP for Security & Anti-Spam
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.ip || '127.0.0.1';

  // 3. Check IP Rate Limit & Ban Status
  const isStrictRoute = pathname.startsWith('/api/agent') || pathname.startsWith('/auth');
  const rateLimitResult = await checkRateLimit(ip, isStrictRoute);

  // If IP is banned
  if (rateLimitResult.isBanned) {
    if (pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({
          error: 'IP_BANNED',
          message: 'Access blocked. Your IP has been temporarily banned due to spam detection.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (pathname !== '/blocked') {
      return NextResponse.redirect(new URL('/blocked', request.url));
    }
    return NextResponse.next();
  }

  // If rate limit exceeded
  if (!rateLimitResult.success) {
    if (pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down and try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
    if (pathname !== '/blocked') {
      return NextResponse.redirect(new URL('/blocked?reason=rate_limit', request.url));
    }
  }

  // Don't protect /blocked route
  if (pathname === '/blocked') {
    return NextResponse.next();
  }

  // 4. Supabase Authentication Check
  const { response, user } = await updateSession(request);

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/auth');
  const isPublicApi = pathname.startsWith('/api/webhooks');

  // If user is logged in and visits login or signup, redirect to dashboard
  if (user && isAuthPage && pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Only enforce login redirect if Supabase is properly configured in env
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://mock-project.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isSupabaseConfigured && !user && !isAuthPage && !isPublicApi) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
