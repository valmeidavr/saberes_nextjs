'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, ChefHat, User, Clock } from 'lucide-react'

interface Receita {
  id: string
  nome: string
  ingredientes: string
  preparo: string
  foto?: string
  usuario: { nome: string }
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [filteredReceitas, setFilteredReceitas] = useState<Receita[]>([])
  const [selectedReceita, setSelectedReceita] = useState<Receita | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) return
    if (session.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }
    fetchReceitas()
  }, [session, router])

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredReceitas(receitas)
    } else {
      const filtered = receitas.filter(receita =>
        receita.nome.toLowerCase().includes(search.toLowerCase()) ||
        receita.ingredientes.toLowerCase().includes(search.toLowerCase()) ||
        receita.usuario.nome.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredReceitas(filtered)
    }
  }, [search, receitas])

  const fetchReceitas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/receitas/user')
      const data = await response.json()
      
      if (response.ok) {
        setReceitas(data.receitas)
        setFilteredReceitas(data.receitas)
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session || session.user?.role === 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation isAdmin={false} />
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Receitas Saudáveis</h1>
          <p className="text-slate-600">Descubra receitas nutritivas e saborosas da comunidade</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
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
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Carregando receitas...</p>
          </div>
        ) : filteredReceitas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReceitas.map((receita) => (
              <Card 
                key={receita.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-amber-500 bg-white"
                onClick={() => {
                  setSelectedReceita(receita)
                  setIsDialogOpen(true)
                }}
              >
                <CardHeader className="pb-3">
                  {receita.foto && (
                    <div className="w-full h-48 mb-4 overflow-hidden rounded-lg relative">
                      <Image 
                        src={receita.foto} 
                        alt={receita.nome}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl group-hover:text-amber-600 transition-colors line-clamp-2">
                      {receita.nome}
                    </CardTitle>
                    <ChefHat className="h-5 w-5 text-amber-500 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      <Badge variant="outline" className="text-xs">
                        {receita.usuario.nome}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-slate-700 mb-2">Ingredientes:</h4>
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {receita.ingredientes}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>Clique para ver o modo de preparo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              {search ? 'Nenhuma receita encontrada' : 'Nenhuma receita disponível'}
            </h3>
            <p className="text-slate-600">
              {search ? 'Tente buscar por outros termos' : 'As receitas aparecerão aqui quando forem cadastradas'}
            </p>
          </div>
        )}

        {selectedReceita && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-amber-500" />
                  {selectedReceita.nome}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Por {selectedReceita.usuario.nome}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedReceita.foto && (
                  <div className="w-full h-64 overflow-hidden rounded-lg relative">
                    <Image 
                      src={selectedReceita.foto} 
                      alt={selectedReceita.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    🥗 Ingredientes
                  </h3>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {selectedReceita.ingredientes}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    👩‍🍳 Modo de Preparo
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {selectedReceita.preparo}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}