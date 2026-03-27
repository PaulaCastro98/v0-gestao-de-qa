'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Bug,
  Zap,
  TrendingUp,
  Target,
} from 'lucide-react'

interface TestExecution {
  id: string
  feature: string
  sprint: string
  status_teste: string
  tipo_teste: string
  ambiente: string
  status_automacao: string
  flaky: string
  bug_id: string | null
  criticidade_defeito: string | null
}

interface Metrics {
  total: number
  pass: number
  fail: number
  blocked: number
  notExecuted: number
  passRate: number
  automated: number
  automationRate: number
  flaky: number
  bugs: number
  byType: Record<string, number>
  byEnvironment: Record<string, number>
  bySprint: Record<string, { total: number; pass: number }>
}

export default function DashboardContent() {
  const [executions, setExecutions] = useState<TestExecution[]>([])
  const [sprint, setSprint] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const url = sprint && sprint !== 'all' 
          ? `/api/test-executions?sprint=${sprint}` 
          : '/api/test-executions'
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setExecutions(data)
          calculateMetrics(data)
        }
      } catch (error) {
        console.error('Erro ao buscar execuções:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchExecutions()
  }, [sprint])

  const calculateMetrics = (data: TestExecution[]) => {
    const total = data.length
    const pass = data.filter(e => e.status_teste === 'Pass').length
    const fail = data.filter(e => e.status_teste === 'Fail').length
    const blocked = data.filter(e => e.status_teste === 'Blocked').length
    const notExecuted = data.filter(e => e.status_teste === 'Not Executed').length
    const automated = data.filter(e => e.status_automacao === 'Automatizado').length
    const flaky = data.filter(e => e.flaky === 'Sim').length
    const bugs = data.filter(e => e.bug_id).length

    const byType: Record<string, number> = {}
    const byEnvironment: Record<string, number> = {}
    const bySprint: Record<string, { total: number; pass: number }> = {}

    data.forEach(e => {
      byType[e.tipo_teste] = (byType[e.tipo_teste] || 0) + 1
      byEnvironment[e.ambiente] = (byEnvironment[e.ambiente] || 0) + 1
      
      if (e.sprint) {
        if (!bySprint[e.sprint]) {
          bySprint[e.sprint] = { total: 0, pass: 0 }
        }
        bySprint[e.sprint].total++
        if (e.status_teste === 'Pass') {
          bySprint[e.sprint].pass++
        }
      }
    })

    setMetrics({
      total,
      pass,
      fail,
      blocked,
      notExecuted,
      passRate: total > 0 ? Math.round((pass / total) * 100) : 0,
      automated,
      automationRate: total > 0 ? Math.round((automated / total) * 100) : 0,
      flaky,
      bugs,
      byType,
      byEnvironment,
      bySprint,
    })
  }

  const sprints = [...new Set(executions.map(e => e.sprint).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visao geral das metricas de QA
          </p>
        </div>
        <Select value={sprint} onValueChange={setSprint}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por Sprint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Sprints</SelectItem>
            {sprints.map(s => (
              <SelectItem key={s} value={s!}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              casos de teste registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.passRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.pass || 0} de {metrics?.total || 0} passaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Automacao</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.automationRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.automated || 0} testes automatizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bugs Encontrados</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.bugs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              defeitos identificados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Testes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Testes</CardTitle>
            <CardDescription>Distribuicao por resultado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{metrics?.pass || 0}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {metrics?.total ? Math.round((metrics.pass / metrics.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Fail</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{metrics?.fail || 0}</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {metrics?.total ? Math.round((metrics.fail / metrics.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{metrics?.blocked || 0}</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    {metrics?.total ? Math.round((metrics.blocked / metrics.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>Not Executed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{metrics?.notExecuted || 0}</span>
                  <Badge variant="secondary">
                    {metrics?.total ? Math.round((metrics.notExecuted / metrics.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por Tipo de Teste</CardTitle>
            <CardDescription>Distribuicao por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.byType && Object.entries(metrics.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / (metrics?.total || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Por Sprint */}
      {metrics?.bySprint && Object.keys(metrics.bySprint).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Sprint</CardTitle>
            <CardDescription>Taxa de sucesso em cada sprint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(metrics.bySprint).map(([sprintName, data]) => {
                const rate = Math.round((data.pass / data.total) * 100)
                return (
                  <div key={sprintName} className="rounded-lg border p-4">
                    <p className="font-medium">{sprintName}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-2xl font-bold ${rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {rate}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({data.pass}/{data.total})
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {(metrics?.flaky || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Atencao: Testes Flaky</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Existem <strong>{metrics?.flaky}</strong> testes marcados como flaky que precisam de atencao.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
