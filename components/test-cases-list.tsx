'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface TestCasesListProps {
  refreshTrigger?: number
}

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

export function TestCasesList({ refreshTrigger }: TestCasesListProps) {
  const [testCases, setTestCases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sprint, setSprint] = useState('')
  const [status, setStatus] = useState('')
  const [periodo, setPeriodo] = useState('')

  useEffect(() => {
    fetchTestCases()
  }, [refreshTrigger, sprint, status, periodo])

  const fetchTestCases = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (sprint) params.append('sprint', sprint)
      if (status) params.append('status', status)
      if (periodo) params.append('periodo', periodo)

      const response = await fetch(`/api/test-cases?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTestCases(data)
      }
    } catch (error) {
      toast.error('Erro ao carregar casos de teste')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTestCase = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este caso?')) return

    try {
      const response = await fetch(`/api/test-cases/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Caso deletado com sucesso')
        fetchTestCases()
      } else {
        toast.error('Erro ao deletar')
      }
    } catch (error) {
      toast.error('Erro ao deletar caso')
    }
  }

  return (
    <Card className="w-full">
      <div className="p-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="w-40">
            <Select value={sprint} onValueChange={setSprint}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Sprints</SelectItem>
                <SelectItem value="Sprint 1">Sprint 1</SelectItem>
                <SelectItem value="Sprint 2">Sprint 2</SelectItem>
                <SelectItem value="Sprint 3">Sprint 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Status</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="90dias">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : testCases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum caso de teste encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Sprint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Analista</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((testCase: any) => (
                  <TableRow key={testCase.id}>
                    <TableCell className="font-medium">{testCase.titulo}</TableCell>
                    <TableCell>{testCase.modulo}</TableCell>
                    <TableCell>{testCase.sprint}</TableCell>
                    <TableCell>
                      <Badge
                        className={statusColors[testCase.status as keyof typeof statusColors]}
                      >
                        {testCase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={priorityColors[testCase.prioridade as keyof typeof priorityColors]}
                      >
                        {testCase.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>{testCase.analista || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/casos-teste/${testCase.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar"
                          onClick={() => {
                            // TODO: Implement edit
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Deletar"
                          onClick={() => deleteTestCase(testCase.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  )
}
