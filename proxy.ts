import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const pathname = request.nextUrl.pathname

  const protectedRoutes = ['/casos-teste', '/dashboard']

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if ((pathname === '/login' || pathname === '/registro') && token) {
    return NextResponse.redirect(new URL('/casos-teste', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/casos-teste/:path*', '/dashboard/:path*', '/login', '/registro'],
}
