'use client'

import { Card } from '@/components/ui/card'
import { Activity, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { label: 'Total de Projetos', value: '0', icon: Activity, color: '#3b82f6' },
    { label: 'Test Cases', value: '0', icon: CheckCircle2, color: '#10b981' },
    { label: 'Bugs Abertos', value: '0', icon: AlertCircle, color: '#ef4444' },
    { label: 'Taxa de Sucesso', value: '0%', icon: TrendingUp, color: '#8b5cf6' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Dashboard de QA
        </h1>
        <p style={{ color: 'var(--color-muted-foreground)' }} className="mt-2">Acompanhe métricas, testes e qualidade do seu projeto</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div 
              key={i} 
              className="group relative overflow-hidden rounded-lg p-6 hover:shadow-lg transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity rounded-full -mr-10 -mt-10"
                style={{ backgroundColor: stat.color }}
              />
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'var(--color-muted-foreground)' }} className="text-sm font-medium">{stat.label}</p>
                    <p style={{ color: 'var(--color-foreground)' }} className="text-3xl font-bold mt-3">{stat.value}</p>
                  </div>
                  <Icon className="w-12 h-12" style={{ color: 'var(--color-muted-foreground)', opacity: 0.4 }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div 
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" style={{ color: '#3b82f6' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>Atividades Recentes</h2>
        </div>
        <p style={{ color: 'var(--color-muted-foreground)' }}>Nenhuma atividade registrada ainda</p>
      </div>
    </div>
  )
}
        </div>
        <p style={{ color: 'var(--color-muted-foreground)' }}>Nenhuma atividade registrada ainda</p>
      </div>
    </div>
  )
}
