// C:\Users\paula.castro\Desktop\projeto-qa\v0-gestao-de-qa\components\controle-page.tsx
'use client'

import { useState } from 'react'
import { TestExecutionsList } from './test-executions-list' // Assumindo named export
import { ExecutionFormModal } from './execution-form-modal' // Assumindo named export
import { BarChart3, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Mude de 'export function ControlePage' para 'export default function ControlePage'
export default function ControlePage() { // <-- AQUI ESTÁ A MUDANÇA
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
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Card de Execuções Ativas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execuções Ativas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">+20.1% do mês passado</p>
            </CardContent>
          </Card>

          {/* Card de Testes Automatizados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Testes Automatizados</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">80%</div>
              <p className="text-xs text-muted-foreground">Cobertura atual</p>
            </CardContent>
          </Card>

          {/* Card de Bugs Abertos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugs Abertos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Prioridade alta</p>
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