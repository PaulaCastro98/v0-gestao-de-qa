import { Metadata } from 'next'
import { TestCaseForm } from '@/components/test-case-form'
import { TestCasesList } from '@/components/test-cases-list'
import { MetricsDashboard } from '@/components/metrics-dashboard'
import Navbar from '@/components/navbar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, ClipboardList } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sistema de Gestão QA',
  description: 'Gestão de casos de teste e métricas de QA',
}

export default function CasosTestePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Sistema de Gestão QA
            </h1>
            <p className="text-slate-600 mt-2">
              Gerenciamento de casos de teste e métricas de qualidade
            </p>
          </div>
          <TestCaseForm />
        </div>

        <Tabs defaultValue="casos" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="casos" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Casos de Teste
            </TabsTrigger>
            <TabsTrigger value="metricas" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="casos" className="space-y-4">
            <TestCasesList />
          </TabsContent>

          <TabsContent value="metricas" className="space-y-4">
            <MetricsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </main>
    </>
  )
}
