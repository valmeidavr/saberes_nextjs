'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      const timer = setTimeout(() => {
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-200 text-xl">Carregando...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Resgatando Saberes</h1>
          <p className="text-slate-300 text-lg mb-8">
            Sistema de gestão de conhecimentos tradicionais, agricultura sustentável e receitas saudáveis.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/auth/signin"
              className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Fazer Login
            </Link>
            
            <div className="flex space-x-4">
              <Link 
                href="/agricultura"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors text-center"
              >
                Agricultura
              </Link>
              <Link 
                href="/receitas"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition-colors text-center"
              >
                Receitas
              </Link>
            </div>
            
            <Link 
              href="/atividades"
              className="block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors text-center"
            >
              Atividades
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-slate-200 text-xl">Redirecionando...</div>
    </div>
  )
}