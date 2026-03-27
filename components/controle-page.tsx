// C:\Users\paula.castro\Desktop\projeto-qa\v0-gestao-de-qa\components\controle-page.tsx
'use client'

import { useState } from 'react'
import { TestExecutionsList } from './test-executions-list'
import { ExecutionFormModal } from './execution-form-modal'

interface TestExecution {
  id: string
  feature: string | null
  historia_git: string | null
  story_points: number
  sprint: string | null
  status_hu: string
  tc_id: string | null
  titulo_tc: string
  tipo_teste: string
  status_teste: string
  resultado_esperado: string | null
  passos: string | null
  requisitos: string | null
  regra: string | null
  prioridade_teste: string
  criticidade_defeito: string | null
  ambiente: string
  bug_id: string | null
  reaberto: string
  problemas_historia: string | null
  problemas_ux_ui: string | null
  status_automacao: string
  flaky: string
  observacoes: string | null
  evidencia_url: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export default function ControlePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedExecution, setSelectedExecution] = useState<any>(null) // Ajuste o tipo conforme sua interface TestExecution
  const [refreshKey, setRefreshKey] = useState(0) // Para forçar a atualização da lista

  const handleNew = () => {
    setSelectedExecution(null)
    setModalOpen(true)
  }

  const handleEdit = (execution: any) => { // Ajuste o tipo conforme sua interface TestExecution
    setSelectedExecution(execution)
    setModalOpen(true)
  }

  const handleSave = () => {
    setModalOpen(false)
    setRefreshKey((prevKey) => prevKey + 1) // Força a re-renderização da lista
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Casos de Teste</h1>
        <p className="text-muted-foreground">
          Gestao centralizada de execucoes de teste
        </p>
      </div>

      <TestExecutionsList
        key={refreshKey}
        onEdit={handleEdit}
        onNew={handleNew}
      />

      <ExecutionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        execution={selectedExecution}
        onSave={handleSave}
      />
    </div>
  )
}