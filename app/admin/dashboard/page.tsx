'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Users, Calendar, ChefHat, Sprout } from 'lucide-react'
import { colors, primaryGradient, secondaryGradient } from '@/lib/colors'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen" style={{ background: primaryGradient }}>
      <Navigation isAdmin={true} />
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard Administrativo</h1>
          <p style={{ color: colors.secondary }}>Visão geral do sistema de gerenciamento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white" style={{ border: `2px solid ${colors.secondary}` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: colors.primary }}>Total de Usuários</CardTitle>
              <Users className="h-4 w-4" style={{ color: colors.secondary }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: colors.primary }}>0</div>
              <p className="text-xs text-gray-600">usuários cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ border: `2px solid ${colors.secondary}` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: colors.primary }}>Atividades</CardTitle>
              <Calendar className="h-4 w-4" style={{ color: colors.secondary }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: colors.primary }}>0</div>
              <p className="text-xs text-gray-600">atividades cadastradas</p>
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ border: `2px solid ${colors.secondary}` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: colors.primary }}>Receitas</CardTitle>
              <ChefHat className="h-4 w-4" style={{ color: colors.secondary }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: colors.primary }}>0</div>
              <p className="text-xs text-gray-600">receitas compartilhadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ border: `2px solid ${colors.secondary}` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: colors.primary }}>Agricultura</CardTitle>
              <Sprout className="h-4 w-4" style={{ color: colors.secondary }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: colors.primary }}>0</div>
              <p className="text-xs text-gray-600">artigos sobre agricultura</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white" style={{ border: `2px solid ${colors.secondary}` }}>
            <CardHeader>
              <CardTitle style={{ color: colors.primary }}>Atividades Recentes</CardTitle>
              <CardDescription className="text-gray-600">
                Últimas atividades cadastradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Nenhuma atividade cadastrada ainda
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ border: `2px solid ${colors.secondary}` }}>
            <CardHeader>
              <CardTitle style={{ color: colors.primary }}>Usuários Ativos</CardTitle>
              <CardDescription className="text-gray-600">
                Usuários que acessaram o sistema recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário ativo no momento
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}