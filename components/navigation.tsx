'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { colors, primaryGradient } from '@/lib/colors'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChangePasswordDialog } from '@/components/change-password-dialog'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  ChefHat, 
  UserCircle,
  LogOut,
  Sprout,
  Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
  isAdmin?: boolean
}

export function Navigation({ isAdmin = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/usuarios', label: 'Usuários', icon: Users },
    { href: '/admin/atividades', label: 'Atividades', icon: Calendar },
    { href: '/admin/receitas', label: 'Receitas', icon: ChefHat },
    { href: '/admin/agricultura', label: 'Agricultura', icon: Sprout },
  ]

  const userNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/receitas', label: 'Receitas', icon: ChefHat },
    { href: '/atividades', label: 'Atividades', icon: Calendar },
  ]

  const navItems = isAdmin ? adminNavItems : userNavItems

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav style={{ background: primaryGradient }} className="backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} className="text-xl font-bold" style={{ color: colors.secondary }}>
              Saberes
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                      isActive
                        ? "text-white"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-gray-200 hover:text-white">
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden sm:block">{session?.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200">
                <DropdownMenuItem 
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="focus:bg-gray-100" style={{ color: colors.primary }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="focus:bg-gray-100" style={{ color: colors.primary }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-200 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20">
            <div className="py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                      isActive
                        ? "text-white"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
      
      <ChangePasswordDialog 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
      />
    </nav>
  )
}