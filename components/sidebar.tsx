'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
  BookOpen,
  Bug,
} from 'lucide-react'

// ADICIONADO: Importação da função 'cn' (alias para clsx)
import { clsx as cn } from 'clsx' // Certifique-se que 'clsx' está instalado (npm install clsx)

// ADICIONADO: Importação do componente Button
// Ajuste o caminho conforme a localização real do seu componente Button
import { Button } from '@/components/ui/button' 

// ADICIONADO: Definição de tipo para os dados do usuário
interface UserData {
  id: string;
  email: string;
  nome: string;
  // Adicione outros campos do usuário se existirem, como 'role', 'avatar', etc.
}

const menuItems = [
  {
    label: 'Histórias',
    href: '/historias',
    icon: BookOpen,
  },
  {
    label: 'Casos de Teste',
    href: '/casos-teste',
    icon: ClipboardList,
  }, // CORRIGIDO: Removido o 'a' solto aqui
  {
    label: 'Bugs',
    href: '/bugs',
    icon: Bug,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
]

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data: UserData = await response.json()
          setUser(data)
        } else {
          // Se a resposta não for OK (ex: 401 Unauthorized), redireciona para login
          router.push('/login')
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        // Em caso de erro na requisição, também pode ser um indicativo de sessão inválida
        router.push('/login')
      }
    }
    fetchUser()
  }, [router]) // Adicionado 'router' como dependência para useEffect

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <span className="text-lg font-bold text-foreground">QA Manager</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex"
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform',
                collapsed && 'rotate-180'
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User and Logout */}
        <div className="border-t p-2">
          {user && !collapsed && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.nome}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        {/* Top bar for mobile */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold">QA Manager</span>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}