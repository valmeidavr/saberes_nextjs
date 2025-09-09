'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Carregar dados salvos no localStorage ao inicializar
  useEffect(() => {
    const savedEmail = localStorage.getItem('saberes_email')
    const savedPassword = localStorage.getItem('saberes_password')
    const savedRemember = localStorage.getItem('saberes_remember') === 'true'
    
    if (savedRemember && savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciais inválidas')
      } else {
        // Salvar ou remover dados do localStorage baseado no checkbox
        if (rememberMe) {
          localStorage.setItem('saberes_email', email)
          localStorage.setItem('saberes_password', password)
          localStorage.setItem('saberes_remember', 'true')
        } else {
          localStorage.removeItem('saberes_email')
          localStorage.removeItem('saberes_password')
          localStorage.removeItem('saberes_remember')
        }

        const session = await getSession()
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    } catch {
      setError('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(41,41,68) 0%, rgb(41,41,68) 50%, rgb(30,30,51) 100%)' }}>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <Image 
              src="/logo.jpg" 
              alt="Logo Saberes" 
              width={120} 
              height={120} 
              className="rounded-full shadow-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold" style={{ color: 'rgb(41,41,68)' }}>Bem-vindo ao Saberes</CardTitle>
          <CardDescription className="text-gray-600">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: 'rgb(41,41,68)' }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(238,183,0)' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-yellow-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: 'rgb(41,41,68)' }}>Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(238,183,0)' }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 bg-gray-50 border-gray-200"
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: 'rgb(41,41,68)' }}
                >
                  Lembrar usuário e senha
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, rgb(238,183,0) 0%, rgb(255,200,20) 100%)' }} 
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="text-center">
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-yellow-400 text-yellow-600 hover:bg-yellow-50"
              >
                <Link href="/auth/signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Nova Conta
                </Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}