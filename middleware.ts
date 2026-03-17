import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const pathname = request.nextUrl.pathname

  // Rotas protegidas
  const protectedRoutes = ['/casos-teste']

  // Se está tentando acessar rota protegida sem token
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Se está logado e tenta acessar login/registro, redireciona para casos-teste
  if ((pathname === '/login' || pathname === '/registro') && token) {
    return NextResponse.redirect(new URL('/casos-teste', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/casos-teste/:path*', '/login', '/registro'],
}
