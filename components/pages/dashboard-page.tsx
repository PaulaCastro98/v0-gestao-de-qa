'use client'

import { Card } from '@/components/ui/card'
import { Activity, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral das métricas e atividades de QA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total de Projetos</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <Activity className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Test Cases</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Bugs Abertos</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Taxa de Sucesso</p>
              <p className="text-3xl font-bold mt-2">0%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Atividades Recentes</h2>
        <p className="text-gray-600">Nenhuma atividade registrada ainda</p>
      </Card>
    </div>
  )
}
