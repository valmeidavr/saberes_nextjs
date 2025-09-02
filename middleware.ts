import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lista de rotas que sempre devem ser acessíveis
  const publicPaths = [
    '/api',
    '/_next',
    '/favicon.ico',
    '/auth',
    '/',
    '/agricultura',
    '/atividades', 
    '/receitas'
  ]

  // Verificar se é uma rota pública
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  try {
    // Obter o token com tratamento de erro
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    // Rotas protegidas admin
    if (pathname.startsWith('/admin')) {
      if (!token) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        return NextResponse.redirect(url)
      }
      
      // Verificar se é admin
      const userRole = (token as any)?.role
      if (userRole !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // Rotas protegidas dashboard
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Em caso de qualquer erro, permitir acesso para evitar crash
    console.error('[Middleware Error]:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ]
}