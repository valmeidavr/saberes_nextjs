'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Edit, Trash2, Calendar, Clock, MapPin, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { colors, primaryGradient, secondaryGradient } from '@/lib/colors'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
}

interface AtividadeFormData {
  nome: string
  descricao: string
  data: string
  hinicio: string
  hfim: string
  local: string
  foto: string
  status: boolean
}

export default function AtividadesPage() {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingAtividade, setEditingAtividade] = useState<Atividade | null>(null)
  const [deletingAtividade, setDeletingAtividade] = useState<Atividade | null>(null)
  const [formData, setFormData] = useState<AtividadeFormData>({
    nome: '',
    descricao: '',
    data: '',
    hinicio: '',
    hfim: '',
    local: '',
    foto: '',
    status: true
  })
  
  const { data: session } = useSession()
  const router = useRouter()

  // Função para formatar data sem problemas de timezone
  const formatDateForInput = (dateString: string): string => {
    // Se a data já está no formato ISO, extrair apenas a parte da data
    if (dateString.includes('T')) {
      return dateString.split('T')[0]
    }
    // Se é uma string de data simples, usar diretamente
    const date = new Date(dateString + 'T00:00:00.000Z')
    return date.toISOString().split('T')[0]
  }

  // Função para criar Date seguro para exibição
  const createSafeDate = (dateString: string): Date => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Se não conseguir parsear, tentar formato ISO
        const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/)
        if (isoMatch) {
          return new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`)
        }
        return new Date()
      }
      // Para exibição de data, queremos sempre mostrar a data local
      return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    } catch {
      return new Date()
    }
  }

  // Função para criar Date seguro para horários
  const createSafeTimeDate = (timeString: string): Date => {
    try {
      const date = new Date(timeString)
      if (isNaN(date.getTime())) {
        // Se não conseguir parsear, tentar extrair apenas a hora
        const timeMatch = timeString.match(/(\d{2}):(\d{2})/)
        if (timeMatch) {
          return new Date(`1970-01-01T${timeMatch[1]}:${timeMatch[2]}:00`)
        }
        return new Date(`1970-01-01T00:00:00`)
      }
      return date
    } catch {
      return new Date(`1970-01-01T00:00:00`)
    }
  }

  const fetchAtividades = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        ...(statusFilter !== 'all' && { status: statusFilter })
      })
      
      const response = await fetch(`/api/atividades?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setAtividades(data.atividades)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    if (!session) return
    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchAtividades()
  }, [session, router, fetchAtividades])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingAtividade ? `/api/atividades/${editingAtividade.id}` : '/api/atividades'
      const method = editingAtividade ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchAtividades()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar atividade')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar atividade')
    }
  }

  const handleEdit = (atividade: Atividade) => {
    setEditingAtividade(atividade)
    const dataFormatada = atividade.data ? formatDateForInput(atividade.data) : ''
    const inicioFormatado = atividade.hinicio ? format(createSafeTimeDate(atividade.hinicio), 'HH:mm') : ''
    const fimFormatado = atividade.hfim ? format(createSafeTimeDate(atividade.hfim), 'HH:mm') : ''
    
    setFormData({
      nome: atividade.nome,
      descricao: atividade.descricao || '',
      data: dataFormatada,
      hinicio: inicioFormatado,
      hfim: fimFormatado,
      local: atividade.local,
      foto: atividade.foto || '',
      status: atividade.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (atividade: Atividade) => {
    setDeletingAtividade(atividade)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingAtividade) return
    
    try {
      const response = await fetch(`/api/atividades/${deletingAtividade.id}`, { method: 'DELETE' })
      
      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingAtividade(null)
        fetchAtividades()
      } else {
        alert('Erro ao excluir atividade')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir atividade')
    }
  }

  const resetForm = () => {
    setEditingAtividade(null)
    setFormData({
      nome: '',
      descricao: '',
      data: '',
      hinicio: '',
      hfim: '',
      local: '',
      foto: '',
      status: true
    })
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: primaryGradient }}>
      <Navigation isAdmin={true} />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Atividades</h1>
            <p style={{ color: colors.secondary }}>Gerencie as atividades do sistema</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="text-white" style={{ backgroundColor: colors.primary }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAtividade ? 'Editar Atividade' : 'Nova Atividade'}
                </DialogTitle>
                <DialogDescription>
                  {editingAtividade 
                    ? 'Atualize as informações da atividade'
                    : 'Preencha os dados para criar uma nova atividade'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome da Atividade</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      placeholder="Descrição da atividade..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hinicio">Hora Início</Label>
                      <Input
                        id="hinicio"
                        type="time"
                        value={formData.hinicio}
                        onChange={(e) => setFormData({...formData, hinicio: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hfim">Hora Fim</Label>
                      <Input
                        id="hfim"
                        type="time"
                        value={formData.hfim}
                        onChange={(e) => setFormData({...formData, hfim: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) => setFormData({...formData, local: e.target.value})}
                      placeholder="Local da atividade"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="foto">URL da Foto</Label>
                    <Input
                      id="foto"
                      value={formData.foto}
                      onChange={(e) => setFormData({...formData, foto: e.target.value})}
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status.toString()} onValueChange={(value) => setFormData({...formData, status: value === 'true'})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativa</SelectItem>
                        <SelectItem value="false">Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingAtividade ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Diálogo de confirmação de exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Excluir Atividade</DialogTitle>
              <DialogDescription>
                Você tem certeza que deseja excluir a atividade{' '}
                <span className="font-semibold">{deletingAtividade?.nome}</span>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Sim, excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Atividades</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as atividades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar atividades..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="true">Ativas</SelectItem>
                  <SelectItem value="false">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data/Horário</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Participantes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {atividades.map((atividade) => (
                        <TableRow key={atividade.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{atividade.nome}</div>
                              {atividade.descricao && (
                                <div className="text-sm text-slate-500 truncate max-w-xs">
                                  {atividade.descricao}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {atividade.data ? format(createSafeDate(atividade.data), 'dd/MM/yyyy', { locale: ptBR }) : 'Data inválida'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="h-4 w-4" />
                              {atividade.hinicio && atividade.hfim ? 
                                `${format(createSafeTimeDate(atividade.hinicio), 'HH:mm')} - ${format(createSafeTimeDate(atividade.hfim), 'HH:mm')}` : 
                                'Horário inválido'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              {atividade.local}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {atividade.participacoes?.length || 0} participantes
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={atividade.status ? 'default' : 'secondary'}>
                              {atividade.status ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(atividade)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(atividade)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-4">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}