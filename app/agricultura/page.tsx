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
import { Search, Sprout, User, Calendar } from 'lucide-react'
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

export default function AgriculturaPage() {
  const [artigos, setArtigos] = useState<Agricultura[]>([])
  const [filteredArtigos, setFilteredArtigos] = useState<Agricultura[]>([])
  const [selectedArtigo, setSelectedArtigo] = useState<Agricultura | null>(null)
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
    fetchArtigos()
  }, [session, router])

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredArtigos(artigos)
    } else {
      const filtered = artigos.filter(artigo =>
        artigo.titulo.toLowerCase().includes(search.toLowerCase()) ||
        artigo.conteudo.toLowerCase().includes(search.toLowerCase()) ||
        artigo.autor.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredArtigos(filtered)
    }
  }, [search, artigos])

  const fetchArtigos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agricultura/user')
      const data = await response.json()
      
      if (response.ok) {
        setArtigos(data.artigos)
        setFilteredArtigos(data.artigos)
      }
    } catch (error) {
      console.error('Erro ao carregar artigos:', error)
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Agricultura & Cultivo</h1>
          <p className="text-slate-600">Aprenda técnicas e dicas de cultivo sustentável</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar artigos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Carregando artigos...</p>
          </div>
        ) : filteredArtigos.length > 0 ? (
          <div className="space-y-6">
            {filteredArtigos.map((artigo) => (
              <Card 
                key={artigo.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-green-500 bg-white"
                onClick={() => {
                  setSelectedArtigo(artigo)
                  setIsDialogOpen(true)
                }}
              >
                <div className="md:flex">
                  {artigo.foto && (
                    <div className="md:w-1/3 w-full h-48 md:h-auto overflow-hidden relative">
                      <Image 
                        src={artigo.foto} 
                        alt={artigo.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className={`${artigo.foto ? 'md:w-2/3' : 'w-full'} p-6`}>
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl group-hover:text-green-600 transition-colors line-clamp-2">
                          {artigo.titulo}
                        </CardTitle>
                        <Sprout className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <Badge variant="outline" className="text-xs">
                            {artigo.autor}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(artigo.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-slate-600 line-clamp-3 leading-relaxed">
                        {artigo.conteudo}
                      </p>
                      <div className="mt-4">
                        <span className="text-sm text-green-600 font-medium group-hover:text-green-700">
                          Clique para ler mais →
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sprout className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">
              {search ? 'Nenhum artigo encontrado' : 'Nenhum artigo disponível'}
            </h3>
            <p className="text-slate-600">
              {search ? 'Tente buscar por outros termos' : 'Os artigos sobre agricultura aparecerão aqui quando forem publicados'}
            </p>
          </div>
        )}

        {selectedArtigo && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Sprout className="h-6 w-6 text-green-500" />
                  {selectedArtigo.titulo}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Por {selectedArtigo.autor}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedArtigo.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedArtigo.foto && (
                  <div className="w-full h-80 overflow-hidden rounded-lg relative">
                    <Image 
                      src={selectedArtigo.foto} 
                      alt={selectedArtigo.titulo}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="prose max-w-none text-slate-700 leading-relaxed">
                    {selectedArtigo.conteudo.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-500 border-t pt-4">
                  <span>Artigo sobre agricultura sustentável</span>
                  <span>Compartilhe o conhecimento! 🌱</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}