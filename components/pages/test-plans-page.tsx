'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function TestPlansPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Plans</h1>
          <p className="text-gray-600 mt-2">Organize planos de teste</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <Card className="p-6">
        <p className="text-gray-600 text-center py-12">Nenhum test plan criado ainda</p>
      </Card>
    </div>
  )
}
