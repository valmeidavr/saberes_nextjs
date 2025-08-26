import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Rotas que requerem autenticação de admin
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Rotas que requerem autenticação básica
    if (pathname.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Redirecionar usuários já autenticados da página de login
    if (pathname === '/auth/signin' && token) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Redirecionar da página raiz baseado no papel do usuário
    if (pathname === '/' && token) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Permitir acesso às rotas de auth sem token
        if (pathname.startsWith('/auth')) {
          return true
        }

        // Permitir acesso à página raiz
        if (pathname === '/') {
          return true
        }

        // Requerer token para outras rotas protegidas
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          return !!token
        }

        return true
      }
    }
  }
)

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/auth/:path*']
}