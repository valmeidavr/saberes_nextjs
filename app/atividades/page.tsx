'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, MapPin, Users, CheckCircle, XCircle } from 'lucide-react'
import { colors, primaryGradient, secondaryGradient } from '@/lib/colors'

interface Atividade {
  id: string
  nome: string
  descricao?: string
  data: string
  hinicio: string
  hfim: string
  local: string
  foto?: string
  status: boolean
  participacoes?: Array<{
    id: string
    usuario: { nome: string }
  }>
  isParticipating?: boolean
}

export default function AtividadesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) return
    if (session.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }
    fetchAtividades()
  }, [session, router])

  const fetchAtividades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/atividades/user')
      const data = await response.json()
      
      if (response.ok) {
        setAtividades(data.atividades)
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipate = async (atividadeId: string) => {
    try {
      const response = await fetch('/api/participacao/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idAtividade: atividadeId })
      })

      if (response.ok) {
        fetchAtividades()
        setIsDialogOpen(false)
        setNotification({type: 'success', message: 'Inscrição realizada com sucesso! 🎉'})
        setTimeout(() => setNotification(null), 4000)
      } else {
        const error = await response.json()
        setNotification({type: 'error', message: error.error || 'Erro ao se inscrever'})
        setTimeout(() => setNotification(null), 4000)
      }
    } catch (error) {
      console.error('Erro:', error)
      setNotification({type: 'error', message: 'Erro ao se inscrever'})
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleCancelParticipation = async (atividadeId: string) => {
    try {
      const response = await fetch(`/api/participacao/user/${atividadeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAtividades()
        setIsDialogOpen(false)
        setNotification({type: 'success', message: 'Inscrição cancelada com sucesso! ✅'})
        setTimeout(() => setNotification(null), 4000)
      } else {
        setNotification({type: 'error', message: 'Erro ao cancelar inscrição'})
        setTimeout(() => setNotification(null), 4000)
      }
    } catch (error) {
      console.error('Erro:', error)
      setNotification({type: 'error', message: 'Erro ao cancelar inscrição'})
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const getAtividadesForDate = (date: Date) => {
    return atividades.filter(atividade => 
      atividade.status && isSameDay(parseISO(atividade.data), date)
    )
  }

  const hasAtividadesForDate = (date: Date) => {
    return getAtividadesForDate(date).length > 0
  }

  const selectedDateAtividades = getAtividadesForDate(selectedDate)

  if (!session || session.user?.role === 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: primaryGradient }}>
      <Navigation isAdmin={false} />
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-l-green-500 text-green-800' 
            : 'bg-red-50 border-l-red-500 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Calendário de Atividades</h1>
          <p style={{ color: colors.secondary }}>Participe das atividades da comunidade</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: colors.primary }}>
                <CalendarIcon className="h-5 w-5" style={{ color: colors.secondary }} />
                Selecione uma Data
              </CardTitle>
              <CardDescription>
                Clique em uma data para ver as atividades disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="rounded-md border"
                modifiers={{
                  hasAtividades: (date) => hasAtividadesForDate(date)
                }}
                modifiersStyles={{
                  hasAtividades: { 
                    backgroundColor: colors.secondary, 
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ color: colors.primary }}>
                Atividades para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
              </CardTitle>
              <CardDescription>
                {selectedDateAtividades.length > 0 
                  ? `${selectedDateAtividades.length} atividade(s) disponível(is)`
                  : 'Nenhuma atividade nesta data'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : selectedDateAtividades.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateAtividades.map((atividade) => (
                    <Card key={atividade.id} className="border-l-4" style={{ borderLeftColor: colors.secondary }}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg" style={{ color: colors.primary }}>{atividade.nome}</h3>
                          {atividade.isParticipating && (
                            <Badge variant="default" className="bg-green-600">
                              Inscrito
                            </Badge>
                          )}
                        </div>
                        
                        {atividade.foto && (
                          <Image 
                            src={atividade.foto} 
                            alt={atividade.nome}
                            width={400}
                            height={160}
                            className="w-full h-40 object-cover rounded mb-3"
                          />
                        )}
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            {format(new Date(atividade.hinicio), 'HH:mm')} - {format(new Date(atividade.hfim), 'HH:mm')}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {atividade.local}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            {atividade.participacoes?.length || 0} participantes
                          </div>
                        </div>
                        
                        {atividade.descricao && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {atividade.descricao}
                          </p>
                        )}
                        
                        <Button 
                          onClick={() => {
                            setSelectedAtividade(atividade)
                            setIsDialogOpen(true)
                          }}
                          className="w-full text-white"
                          style={{ backgroundColor: colors.secondary }}
                        >
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white opacity-80">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4" style={{ color: colors.secondary, opacity: 0.5 }} />
                  <p>Nenhuma atividade programada para esta data</p>
                  <p className="text-sm mt-2">Selecione outra data no calendário</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedAtividade && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl" style={{ color: colors.primary }}>{selectedAtividade.nome}</DialogTitle>
                <DialogDescription>
                  {format(parseISO(selectedAtividade.data), 'dd/MM/yyyy', { locale: ptBR })} • {format(new Date(selectedAtividade.hinicio), 'HH:mm')} - {format(new Date(selectedAtividade.hfim), 'HH:mm')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedAtividade.foto && (
                  <Image 
                    src={selectedAtividade.foto} 
                    alt={selectedAtividade.nome}
                    width={600}
                    height={256}
                    className="w-full h-64 object-cover rounded"
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" style={{ color: colors.secondary }} />
                    <span>{selectedAtividade.local}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: colors.secondary }} />
                    <span>{selectedAtividade.participacoes?.length || 0} participantes</span>
                  </div>
                </div>
                
                {selectedAtividade.descricao && (
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: colors.primary }}>Descrição</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedAtividade.descricao}
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {selectedAtividade.isParticipating ? (
                  <Button 
                    variant="destructive"
                    onClick={() => handleCancelParticipation(selectedAtividade.id)}
                  >
                    Cancelar Inscrição
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleParticipate(selectedAtividade.id)}
                    className="text-white"
                    style={{ backgroundColor: colors.secondary }}
                  >
                    Participar da Atividade
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}