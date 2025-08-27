'use client'

import { useState, useEffect } from 'react'
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
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: 'PADRAO' | 'ADMIN'
  sexo: string
  cep: string
  complemento?: string
  numero: number
  bairro: string
  cidade: string
  uf: string
  status: boolean
}

interface UsuarioFormData {
  nome: string
  email: string
  password: string
  perfil: 'PADRAO' | 'ADMIN'
  sexo: string
  cep: string
  complemento: string
  numero: string
  bairro: string
  cidade: string
  uf: string
  status: boolean
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [formData, setFormData] = useState<UsuarioFormData>({
    nome: '',
    email: '',
    password: '',
    perfil: 'PADRAO',
    sexo: '',
    cep: '',
    complemento: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    status: true
  })
  
  const { data: session } = useSession()
  const router = useRouter()

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  ]

  useEffect(() => {
    if (!session) return
    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchUsuarios()
  }, [session, search, statusFilter, page, router])

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        ...(statusFilter !== 'all' && { status: statusFilter })
      })
      
      const response = await fetch(`/api/usuarios?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setUsuarios(data.usuarios)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAddressByCep = async (cep: string) => {
    if (cep.length !== 8) return
    
    setCepLoading(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setCepLoading(false)
    }
  }

  const handleCepChange = (value: string) => {
    const cleanCep = value.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, cep: cleanCep }))
    
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : '/api/usuarios'
      const method = editingUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchUsuarios()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar usuário')
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      password: '',
      perfil: usuario.perfil,
      sexo: usuario.sexo,
      cep: usuario.cep,
      complemento: usuario.complemento || '',
      numero: usuario.numero.toString(),
      bairro: usuario.bairro,
      cidade: usuario.cidade,
      uf: usuario.uf,
      status: usuario.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    
    try {
      const response = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        fetchUsuarios()
      } else {
        alert('Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir usuário')
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({
      nome: '',
      email: '',
      password: '',
      perfil: 'PADRAO',
      sexo: '',
      cep: '',
      complemento: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
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
            <h1 className="text-3xl font-bold text-slate-900">Usuários</h1>
            <p className="text-slate-600">Gerencie os usuários do sistema</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-slate-800 hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? 'Atualize as informações do usuário'
                    : 'Preencha os dados para criar um novo usuário'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">
                      Senha {editingUser && '(deixe vazio para manter atual)'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required={!editingUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="perfil">Perfil</Label>
                      <Select value={formData.perfil} onValueChange={(value: 'PADRAO' | 'ADMIN') => setFormData({...formData, perfil: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PADRAO">Padrão</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sexo">Sexo</Label>
                      <Select value={formData.sexo} onValueChange={(value) => setFormData({...formData, sexo: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o sexo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        placeholder="Digite o CEP (8 dígitos)"
                        maxLength={8}
                        required
                      />
                      {cepLoading && <span className="text-xs text-slate-500">Buscando endereço...</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        type="number"
                        value={formData.numero}
                        onChange={(e) => setFormData({...formData, numero: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => setFormData({...formData, complemento: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="uf">UF</Label>
                      <Select value={formData.uf} onValueChange={(value) => setFormData({...formData, uf: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {ufs.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                    {editingUser ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuários..."
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
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">{usuario.nome}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge variant={usuario.perfil === 'ADMIN' ? 'default' : 'secondary'}>
                              {usuario.perfil === 'ADMIN' ? 'Admin' : 'Padrão'}
                            </Badge>
                          </TableCell>
                          <TableCell>{usuario.cidade}/{usuario.uf}</TableCell>
                          <TableCell>
                            <Badge variant={usuario.status ? 'default' : 'secondary'}>
                              {usuario.status ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(usuario)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(usuario.id)}
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