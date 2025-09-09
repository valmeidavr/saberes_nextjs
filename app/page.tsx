'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { colors, primaryGradient } from '@/lib/colors'
import { UserPlus, LogIn, Users, Activity, Utensils, Loader2 } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else if (status === 'unauthenticated') {
      // Mostrar tela de boas-vindas por alguns segundos antes de redirecionar
      setShowWelcome(true)
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: primaryGradient }}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p className="text-xl text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: primaryGradient }}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p className="text-xl text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: primaryGradient }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Resgatando Saberes</h1>
        </div>

        {/* Cards de Funcionalidades */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-2 text-white" />
              <CardTitle className="text-white">Agricultura</CardTitle>
              <CardDescription className="text-white/80">
                Técnicas tradicionais de cultivo e manejo da terra
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 text-white" />
              <CardTitle className="text-white">Atividades</CardTitle>
              <CardDescription className="text-white/80">
                Práticas culturais e eventos comunitários
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Utensils className="w-12 h-12 mx-auto mb-2 text-white" />
              <CardTitle className="text-white">Receitas</CardTitle>
              <CardDescription className="text-white/80">
                Sabores e receitas tradicionais da região
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Card de Ação */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white">
            <CardHeader className="text-center">
              <CardTitle style={{ color: colors.primary }}>Entre na Comunidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                asChild 
                className="w-full text-white" 
                style={{ backgroundColor: colors.primary }}
              >
                <Link href="/auth/signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Conta
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="w-full"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                <Link href="/auth/signin">
                  <LogIn className="w-4 h-4 mr-2" />
                  Já tenho conta
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
        </div>
      </div>
    </div>
  )
}