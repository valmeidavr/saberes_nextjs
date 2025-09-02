'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(41,41,68) 0%, rgb(41,41,68) 50%, rgb(30,30,51) 100%)' }}>
      <div className="text-xl" style={{ color: 'rgb(238,183,0)' }}>Carregando...</div>
    </div>
  )
}