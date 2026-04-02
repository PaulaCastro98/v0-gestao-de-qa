'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className={`${
          open ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {open && <h1 className="font-bold text-lg">QA Manager</h1>}
          <button
            onClick={() => setOpen(!open)}
            className="p-1 hover:bg-slate-800 rounded"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                {open && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-red-400 hover:text-red-300 justify-start"
          >
            <LogOut size={20} />
            {open && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
