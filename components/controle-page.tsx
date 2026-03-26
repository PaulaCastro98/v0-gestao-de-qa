'use client'

import { useState } from 'react'
import { TestExecutionsList } from './test-executions-list'
import { ExecutionFormModal } from './execution-form-modal'
import { BarChart3, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TestExecution {
  id: string
  feature: string
  historia_git: string
  story_points: number
  sprint: string
  status_hu: string
  tc_id: string
  tipo_teste: string
  status_teste: string
  bug_id: string | null
  criticidade: string
  ambiente: string
  insights_qa: string | null
  automacao: boolean
  flaky: boolean
  created_at: string
  updated_at: string
}

export default function ControlePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (execution: TestExecution) => {
    setSelectedExecution(execution)
    setModalOpen(true)
  }

  const handleNew = () => {
    setSelectedExecution(undefined)
    setModalOpen(true)
  }

  const handleSave = () => {
    setRefreshKey((prev) => prev + 1)
    setModalOpen(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Controle de Qualidade QA
          </h1>
          <p className="text-slate-600 mt-2">
            Gestão centralizada de execuções de teste e métricas de qualidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Execuções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Testes Flaky
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Execuções de Teste
            </CardTitle>
            <CardDescription>
              Listagem completa de todas as execuções de teste registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestExecutionsList
              key={refreshKey}
              onEdit={handleEdit}
              onNew={handleNew}
            />
          </CardContent>
        </Card>

        <ExecutionFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          execution={selectedExecution}
          onSave={handleSave}
        />
      </div>
    </main>
  )
}
