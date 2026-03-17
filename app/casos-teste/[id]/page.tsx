'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const statusColors = {
  Rascunho: 'bg-gray-100 text-gray-800',
  'Em Andamento': 'bg-blue-100 text-blue-800',
  Aprovado: 'bg-green-100 text-green-800',
  Reprovado: 'bg-red-100 text-red-800',
}

const priorityColors = {
  Baixa: 'bg-blue-50 text-blue-700',
  Média: 'bg-yellow-50 text-yellow-700',
  Alta: 'bg-orange-50 text-orange-700',
  Crítica: 'bg-red-50 text-red-700',
}

export default function CasoTestePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [testCase, setTestCase] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTestCase()
  }, [id])

  const fetchTestCase = async () => {
    try {
      const response = await fetch(`/api/test-cases/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTestCase(data)
      } else {
        toast.error('Caso não encontrado')
        router.push('/casos-teste')
      }
    } catch (error) {
      toast.error('Erro ao carregar caso')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar este caso?')) return

    try {
      const response = await fetch(`/api/test-cases/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Caso deletado com sucesso')
        router.push('/casos-teste')
      } else {
        toast.error('Erro ao deletar')
      }
    } catch (error) {
      toast.error('Erro ao deletar caso')
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">Carregando...</div>
        </div>
      </main>
    )
  }

  if (!testCase) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/casos-teste">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <Card className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">
                {testCase.titulo}
              </h1>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  className={
                    statusColors[testCase.status as keyof typeof statusColors]
                  }
                >
                  {testCase.status}
                </Badge>
                <Badge
                  className={
                    priorityColors[
                      testCase.prioridade as keyof typeof priorityColors
                    ]
                  }
                >
                  {testCase.prioridade}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" title="Editar">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                title="Deletar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">
                Módulo
              </h3>
              <p className="text-slate-900">{testCase.modulo}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">
                Sprint
              </h3>
              <p className="text-slate-900">{testCase.sprint}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">
                Ambiente
              </h3>
              <p className="text-slate-900">{testCase.ambiente}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">
                Analista
              </h3>
              <p className="text-slate-900">{testCase.analista || '-'}</p>
            </div>
          </div>

          <Separator />

          {testCase.descricao && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {testCase.descricao}
                </p>
              </div>
              <Separator />
            </>
          )}

          {testCase.passos && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Passos do Teste</h3>
                <p className="text-slate-700 whitespace-pre-wrap font-mono text-sm">
                  {testCase.passos}
                </p>
              </div>
              <Separator />
            </>
          )}

          {testCase.resultado_esperado && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Resultado Esperado</h3>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {testCase.resultado_esperado}
                </p>
              </div>
              <Separator />
            </>
          )}

          {testCase.resultado_atual && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Resultado Atual</h3>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {testCase.resultado_atual}
                </p>
              </div>
              <Separator />
            </>
          )}

          {testCase.notas && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notas</h3>
              <p className="text-slate-700 whitespace-pre-wrap">
                {testCase.notas}
              </p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
            <div>
              <h4 className="font-semibold">Criado em:</h4>
              <p>
                {new Date(testCase.data_criacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Atualizado em:</h4>
              <p>
                {new Date(testCase.data_atualizacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
