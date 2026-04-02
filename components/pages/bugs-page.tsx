'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function BugsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bugs</h1>
          <p className="text-gray-600 mt-2">Reporte e gerencie bugs encontrados</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Bug
        </Button>
      </div>

      <Card className="p-6">
        <p className="text-gray-600 text-center py-12">Nenhum bug reportado ainda</p>
      </Card>
    </div>
  )
}
