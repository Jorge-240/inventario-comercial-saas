import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has('inventario_session');
  const isLogin = request.nextUrl.pathname === '/login';
  if (!hasSession && !isLogin) return NextResponse.redirect(new URL('/login', request.url));
  if (hasSession && isLogin) return NextResponse.redirect(new URL('/dashboard', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/productos/:path*', '/inventario/:path*', '/login'] };
