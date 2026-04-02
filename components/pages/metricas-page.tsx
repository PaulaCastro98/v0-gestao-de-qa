'use client'

import { Card } from '@/components/ui/card'

export default function MetricasPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Métricas</h1>
        <p className="text-gray-600 mt-2">Análise completa de desempenho de QA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Cobertura de Testes</h2>
          <p className="text-gray-600 text-center py-8">Dados indisponíveis</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Defects por Severidade</h2>
          <p className="text-gray-600 text-center py-8">Dados indisponíveis</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Tendência de Bugs</h2>
          <p className="text-gray-600 text-center py-8">Dados indisponíveis</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Desempenho de Testes</h2>
          <p className="text-gray-600 text-center py-8">Dados indisponíveis</p>
        </Card>
      </div>
    </div>
  )
}
