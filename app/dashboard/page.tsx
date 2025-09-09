'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Sprout, ChefHat } from 'lucide-react'
import { colors, primaryGradient, secondaryGradient } from '@/lib/colors'

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: primaryGradient }}>
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!session || session.user?.role === 'ADMIN') {
    router.push('/admin/dashboard')
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: primaryGradient }}>
      <Navigation isAdmin={false} />
      
      <main className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bem-vindo ao <span style={{ color: colors.secondary }}>Resgatando Saberes</span>
          </h1>
          <p className="text-xl mb-2" style={{ color: colors.secondary }}>
            Olá, {session.user.name}!
          </p>
          <p className="text-lg text-white opacity-80 max-w-2xl mx-auto">
            Veja o que o app tem a oferecer para você descobrir, aprender e participar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 bg-white" style={{ borderColor: 'rgba(238, 183, 0, 0.3)' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: secondaryGradient }}>
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold" style={{ color: colors.primary }}>Calendário</CardTitle>
              <CardDescription className="text-gray-600">
                Participe de atividades e eventos da comunidade
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 mb-6">
                Veja as atividades disponíveis e se inscreva nas que mais te interessam
              </p>
              <Link href="/atividades">
                <Button className="w-full text-white font-semibold py-3 text-lg" style={{ backgroundColor: colors.secondary }}>
                  Ver Atividades
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 bg-white" style={{ borderColor: 'rgba(238, 183, 0, 0.3)' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: secondaryGradient }}>
                <Sprout className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold" style={{ color: colors.primary }}>Agricultura/Cultivo</CardTitle>
              <CardDescription className="text-gray-600">
                Aprenda técnicas e dicas de cultivo sustentável
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 mb-6">
                Descubra conhecimentos sobre agricultura e práticas sustentáveis
              </p>
              <Link href="/agricultura">
                <Button className="w-full text-white font-semibold py-3 text-lg" style={{ backgroundColor: colors.secondary }}>
                  Explorar Cultivo
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-2 bg-white" style={{ borderColor: 'rgba(238, 183, 0, 0.3)' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: secondaryGradient }}>
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold" style={{ color: colors.primary }}>Receitas Saudáveis</CardTitle>
              <CardDescription className="text-gray-600">
                Descubra receitas nutritivas e saborosas
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 mb-6">
                Explore uma coleção de receitas saudáveis e sustentáveis
              </p>
              <Link href="/receitas">
                <Button className="w-full text-white font-semibold py-3 text-lg" style={{ backgroundColor: colors.secondary }}>
                  Ver Receitas
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-white" style={{ border: `2px solid ${colors.secondary}` }}>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
                🌱 Resgatando Saberes
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Conecte-se com a sabedoria ancestral, participe de atividades comunitárias, 
                aprenda técnicas sustentáveis de cultivo e descubra receitas que nutrem o corpo e a alma.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}