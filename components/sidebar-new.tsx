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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          open ? 'w-72' : 'w-20'
        } bg-gradient-to-b from-background to-muted border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          {open && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-primary-foreground text-sm">
                QA
              </div>
              <span className="font-bold text-foreground">QA Manager</span>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            {open ? <X size={20} className="text-muted-foreground" /> : <Menu size={20} className="text-muted-foreground" />}
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                {open && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}

          {/* Projects Section */}
          {open && projects.length > 0 && (
            <div className="pt-6 mt-4 border-t border-border/50">
              <button
                onClick={() => setProjectsOpen(!projectsOpen)}
                className="flex items-center gap-2 w-full px-4 py-2 text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground transition-colors font-semibold"
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
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                        activeProjectId === project.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
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
        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <LogOut size={20} />
            {open && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  )
}
