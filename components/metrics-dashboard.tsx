'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      toast.error('Erro ao carregar métricas')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando métricas...</div>
  }

  const summaryStats = metrics.reduce(
    (acc, m) => ({
      totalCasos: acc.totalCasos + (m.total_casos || 0),
      aprovados: acc.aprovados + (m.casos_aprovados || 0),
      reprovados: acc.reprovados + (m.casos_reprovados || 0),
      criticos: acc.criticos + (m.defeitos_criticos || 0),
    }),
    { totalCasos: 0, aprovados: 0, reprovados: 0, criticos: 0 }
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Total de Casos</p>
            <p className="text-3xl font-bold">{summaryStats.totalCasos}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Aprovados</p>
            <p className="text-3xl font-bold text-green-600">
              {summaryStats.aprovados}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Reprovados</p>
            <p className="text-3xl font-bold text-red-600">
              {summaryStats.reprovados}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Críticos</p>
            <p className="text-3xl font-bold text-orange-600">
              {summaryStats.criticos}
            </p>
          </div>
        </Card>
      </div>

      {metrics.length > 0 && (
        <>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Taxa de Aprovação por Sprint</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="taxa_aprovacao"
                  stroke="#10b981"
                  name="Taxa de Aprovação (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Distribuição de Casos por Sprint</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="casos_aprovados"
                  fill="#10b981"
                  name="Aprovados"
                />
                <Bar
                  dataKey="casos_reprovados"
                  fill="#ef4444"
                  name="Reprovados"
                />
                <Bar
                  dataKey="em_andamento"
                  fill="#f59e0b"
                  name="Em Andamento"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  )
}
