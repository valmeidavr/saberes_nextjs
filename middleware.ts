import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  

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
    // Em caso de erro, negar acesso a rotas protegidas
    console.error('[Middleware Error]:', error)
    
    // Se for rota admin ou dashboard, redirecionar para login
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*'
  ]
}