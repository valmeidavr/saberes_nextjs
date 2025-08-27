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
import { Plus, Search, Edit, Trash2, Sprout, Calendar } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Agricultura {
  id: string
  titulo: string
  conteudo: string
  foto?: string
  autor: string
  status: boolean
  createdAt: string
}

interface AgriculturaFormData {
  titulo: string
  conteudo: string
  foto: string
  autor: string
  status: boolean
}

export default function AgriculturaAdminPage() {
  const [artigos, setArtigos] = useState<Agricultura[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingArtigo, setEditingArtigo] = useState<Agricultura | null>(null)
  const [formData, setFormData] = useState<AgriculturaFormData>({
    titulo: '',
    conteudo: '',
    foto: '',
    autor: '',
    status: true
  })
  
  const { data: session } = useSession()
  const router = useRouter()

  const fetchArtigos = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        ...(statusFilter !== 'all' && { status: statusFilter })
      })
      
      const response = await fetch(`/api/agricultura?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setArtigos(data.artigos)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Erro ao carregar artigos:', error)
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
    fetchArtigos()
  }, [session, router, fetchArtigos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingArtigo ? `/api/agricultura/${editingArtigo.id}` : '/api/agricultura'
      const method = editingArtigo ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchArtigos()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar artigo')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar artigo')
    }
  }

  const handleEdit = (artigo: Agricultura) => {
    setEditingArtigo(artigo)
    setFormData({
      titulo: artigo.titulo,
      conteudo: artigo.conteudo,
      foto: artigo.foto || '',
      autor: artigo.autor,
      status: artigo.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return
    
    try {
      const response = await fetch(`/api/agricultura/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        fetchArtigos()
      } else {
        alert('Erro ao excluir artigo')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir artigo')
    }
  }

  const resetForm = () => {
    setEditingArtigo(null)
    setFormData({
      titulo: '',
      conteudo: '',
      foto: '',
      autor: '',
      status: true
    })
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation isAdmin={true} />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Agricultura</h1>
            <p className="text-slate-600">Gerencie os artigos sobre agricultura e cultivo</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-slate-800 hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Artigo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingArtigo ? 'Editar Artigo' : 'Novo Artigo'}
                </DialogTitle>
                <DialogDescription>
                  {editingArtigo 
                    ? 'Atualize as informações do artigo'
                    : 'Preencha os dados para criar um novo artigo'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="titulo">Título do Artigo</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="autor">Autor</Label>
                    <Input
                      id="autor"
                      value={formData.autor}
                      onChange={(e) => setFormData({...formData, autor: e.target.value})}
                      placeholder="Nome do autor"
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
                    <Label htmlFor="conteudo">Conteúdo do Artigo</Label>
                    <Textarea
                      id="conteudo"
                      value={formData.conteudo}
                      onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                      placeholder="Escreva o conteúdo do artigo..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status.toString()} onValueChange={(value) => setFormData({...formData, status: value === 'true'})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingArtigo ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Artigos</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os artigos sobre agricultura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar artigos..."
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
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {artigos.map((artigo) => (
                        <TableRow key={artigo.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Sprout className="h-4 w-4 text-green-500" />
                              <div>
                                <div className="font-medium">{artigo.titulo}</div>
                                <div className="text-sm text-slate-500 line-clamp-1">
                                  {artigo.conteudo.substring(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{artigo.autor}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {format(new Date(artigo.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={artigo.status ? 'default' : 'secondary'}>
                              {artigo.status ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(artigo)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(artigo.id)}
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