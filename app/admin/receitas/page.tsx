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
import { Plus, Search, Edit, Trash2, User, ChefHat } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Usuario {
  id: string
  nome: string
}

interface Receita {
  id: string
  nome: string
  ingredientes: string
  preparo: string
  foto?: string
  idUsuario: string
  usuario: { nome: string }
}

interface ReceitaFormData {
  nome: string
  ingredientes: string
  preparo: string
  foto: string
  idUsuario: string
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null)
  const [formData, setFormData] = useState<ReceitaFormData>({
    nome: '',
    ingredientes: '',
    preparo: '',
    foto: '',
    idUsuario: ''
  })
  
  const { data: session } = useSession()
  const router = useRouter()

  const fetchReceitas = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search
      })
      
      const response = await fetch(`/api/receitas?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setReceitas(data.receitas)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await fetch('/api/usuarios?limit=1000')
      const data = await response.json()
      
      if (response.ok) {
        setUsuarios(data.usuarios.filter((u: {status: boolean}) => u.status))
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchReceitas()
    fetchUsuarios()
  }, [session, router, fetchReceitas, fetchUsuarios])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingReceita ? `/api/receitas/${editingReceita.id}` : '/api/receitas'
      const method = editingReceita ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchReceitas()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar receita')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar receita')
    }
  }

  const handleEdit = (receita: Receita) => {
    setEditingReceita(receita)
    setFormData({
      nome: receita.nome,
      ingredientes: receita.ingredientes,
      preparo: receita.preparo,
      foto: receita.foto || '',
      idUsuario: receita.idUsuario
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return
    
    try {
      const response = await fetch(`/api/receitas/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        fetchReceitas()
      } else {
        alert('Erro ao excluir receita')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir receita')
    }
  }

  const resetForm = () => {
    setEditingReceita(null)
    setFormData({
      nome: '',
      ingredientes: '',
      preparo: '',
      foto: '',
      idUsuario: ''
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
            <h1 className="text-3xl font-bold text-slate-900">Receitas</h1>
            <p className="text-slate-600">Gerencie as receitas do sistema</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-slate-800 hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingReceita ? 'Editar Receita' : 'Nova Receita'}
                </DialogTitle>
                <DialogDescription>
                  {editingReceita 
                    ? 'Atualize as informações da receita'
                    : 'Preencha os dados para criar uma nova receita'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome da Receita</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="idUsuario">Autor</Label>
                    <Select value={formData.idUsuario} onValueChange={(value) => setFormData({...formData, idUsuario: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o autor" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="ingredientes">Ingredientes</Label>
                    <Textarea
                      id="ingredientes"
                      value={formData.ingredientes}
                      onChange={(e) => setFormData({...formData, ingredientes: e.target.value})}
                      placeholder="Liste os ingredientes necessários..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="preparo">Modo de Preparo</Label>
                    <Textarea
                      id="preparo"
                      value={formData.preparo}
                      onChange={(e) => setFormData({...formData, preparo: e.target.value})}
                      placeholder="Descreva o modo de preparo passo a passo..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingReceita ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Receitas</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as receitas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar receitas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Ingredientes</TableHead>
                        <TableHead>Modo de Preparo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receitas.map((receita) => (
                        <TableRow key={receita.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <ChefHat className="h-4 w-4 text-slate-400" />
                              {receita.nome}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <Badge variant="outline">{receita.usuario.nome}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm">
                              {receita.ingredientes}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm">
                              {receita.preparo}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(receita)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(receita.id)}
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