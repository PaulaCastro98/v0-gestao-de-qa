'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function TestRunsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Runs</h1>
          <p className="text-gray-600 mt-2">Execute e monitore execuções de teste</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Execução
        </Button>
      </div>

      <Card className="p-6">
        <p className="text-gray-600 text-center py-12">Nenhuma execução de teste criada ainda</p>
      </Card>
    </div>
  )
}
