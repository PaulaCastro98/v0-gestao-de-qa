'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Menu,
  X,
  Home,
  Briefcase,
  CheckSquare,
  ClipboardList,
  Play,
  Bug,
  BarChart3,
  LogOut,
  ChevronDown,
  ChevronRight,
  FolderKanban,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Projetos', href: '/projetos', icon: Briefcase },
  { label: 'Test Suites', href: '/test-suites', icon: CheckSquare },
  { label: 'Test Cases', href: '/test-cases', icon: ClipboardList },
  { label: 'Test Plans', href: '/test-plans', icon: BarChart3 },
  { label: 'Test Runs', href: '/test-runs', icon: Play },
  { label: 'Bugs', href: '/bugs', icon: Bug },
  { label: 'Métricas', href: '/metricas', icon: BarChart3 },
]

export default function SidebarNew({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <div
        className={`${open ? 'w-72' : 'w-20'} transition-all duration-300 flex flex-col`}
        style={{ 
          backgroundColor: 'var(--color-muted)', 
          borderRight: '1px solid var(--color-border)' 
        }}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          {open && (
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'white'
                }}
              >
                QA
              </div>
              <span className="font-bold text-lg" style={{ color: 'var(--color-foreground)' }}>QA Manager</span>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            {open ? <X size={20} style={{ color: 'var(--color-muted-foreground)' }} /> : <Menu size={20} style={{ color: 'var(--color-muted-foreground)' }} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200"
                style={isActive ? {
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                } : {
                  color: 'var(--color-muted-foreground)',
                }}
              >
                <Icon size={20} />
                {open && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}

          {/* Projects Section */}
          {open && projects.length > 0 && (
            <div className="pt-6 mt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setProjectsOpen(!projectsOpen)}
                className="flex items-center gap-2 w-full px-4 py-2 text-xs uppercase tracking-wider transition-colors font-semibold"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {projectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Projetos
              </button>
              {projectsOpen && (
                <div className="mt-3 space-y-1">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projetos?id=${project.id}`}
                      onClick={() => setActiveProjectId(project.id)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all"
                      style={activeProjectId === project.id ? {
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      } : {
                        color: 'var(--color-muted-foreground)'
                      }}
                    >
                      <FolderKanban size={16} />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200 hover:opacity-80"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <LogOut size={20} />
            {open && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--color-background)' }}>{children}</main>
    </div>
  )
}
