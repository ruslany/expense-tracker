import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const BOT_USER_AGENTS =
  /TelegramBot|facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Googlebot|Slackbot|Discordbot/i;

const OG_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Expense Tracker</title>
  <meta property="og:title" content="Expense Tracker" />
  <meta property="og:description" content="Personal expense tracking and management application" />
  <meta property="og:site_name" content="Expense Tracker" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Expense Tracker" />
  <meta name="twitter:description" content="Personal expense tracking and management application" />
</head>
<body></body>
</html>`;

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Allow auth-related routes
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Serve minimal OG metadata to bots without exposing protected content
  if (!isLoggedIn) {
    const userAgent = req.headers.get('user-agent') ?? '';
    if (BOT_USER_AGENTS.test(userAgent)) {
      return new NextResponse(OG_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  // Redirect unauthenticated users to sign-in
  if (!isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
