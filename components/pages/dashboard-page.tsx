'use client'

import { Card } from '@/components/ui/card'
import { Activity, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { label: 'Total de Projetos', value: '0', icon: Activity, color: 'from-blue-600 to-blue-400' },
    { label: 'Test Cases', value: '0', icon: CheckCircle2, color: 'from-green-600 to-green-400' },
    { label: 'Bugs Abertos', value: '0', icon: AlertCircle, color: 'from-red-600 to-red-400' },
    { label: 'Taxa de Sucesso', value: '0%', icon: TrendingUp, color: 'from-purple-600 to-purple-400' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Dashboard de QA
        </h1>
        <p className="text-muted-foreground mt-2">Acompanhe métricas, testes e qualidade do seu projeto</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="group relative overflow-hidden rounded-lg border border-border bg-muted/50 p-6 hover:bg-muted/80 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 -mr-10 -mt-10 rounded-full group-hover:opacity-20 transition-opacity`} />
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold mt-3 text-foreground">{stat.value}</p>
                  </div>
                  <Icon className="w-12 h-12 text-muted-foreground opacity-40" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-muted/30 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Atividades Recentes</h2>
        </div>
        <p className="text-muted-foreground">Nenhuma atividade registrada ainda</p>
      </div>
    </div>
  )
}
