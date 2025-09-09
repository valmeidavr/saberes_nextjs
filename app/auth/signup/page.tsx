'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { colors, primaryGradient } from '@/lib/colors'
import { UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validações básicas
    if (!formData.nome || !formData.email || !formData.senha) {
      setError('Todos os campos são obrigatórios')
      setLoading(false)
      return
    }

    if (formData.senha !== formData.confirmSenha) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      // Criar usuário
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta')
        setLoading(false)
        return
      }

      // Autenticar automaticamente após cadastro
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.senha,
        redirect: false
      })

      if (result?.error) {
        setError('Conta criada, mas erro no login automático. Tente fazer login.')
        setLoading(false)
        return
      }

      // Redirecionar para dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Erro:', error)
      setError('Erro interno. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: primaryGradient }}>
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Card className="bg-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl" style={{ color: colors.primary }}>
                Criar Conta
              </CardTitle>
              <CardDescription>
                Cadastre-se para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(238,183,0)' }} />
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(238,183,0)' }} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(238,183,0)' }} />
                    <Input
                      id="senha"
                      type="password"
                      placeholder="Sua senha (mín. 6 caracteres)"
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
                      className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-yellow-400"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmSenha">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(238,183,0)' }} />
                    <Input
                      id="confirmSenha"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={formData.confirmSenha}
                      onChange={(e) => setFormData({...formData, confirmSenha: e.target.value})}
                      className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-yellow-400"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full text-white hover:opacity-90 transition-opacity" 
                  style={{ background: 'linear-gradient(135deg, rgb(238,183,0) 0%, rgb(255,200,20) 100%)' }}
                  disabled={loading}
                >
                  {loading ? (
                    'Criando conta...'
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar Conta
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <Link href="/auth/signin" className="text-blue-600 hover:underline">
                      Fazer login
                    </Link>
                  </p>
                </div>

                <div className="text-center">
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="text-gray-600"
                  >
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao início
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}