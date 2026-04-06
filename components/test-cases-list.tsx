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

interface TestCase {
  id: string
  title: string
  status: string
  priority: string
  type: string
  suite_id?: number
  created_at?: string
}

interface TestCasesListProps {
  refreshTrigger?: number
  onEdit?: (testCase: TestCase) => void
}

// ✅ Status e cores atualizados para os valores do banco
const statusColors: Record<string, string> = {
  'Pendente': 'bg-gray-100 text-gray-800',
  'Em andamento': 'bg-blue-100 text-blue-800',
  'Aprovado': 'bg-green-100 text-green-800',
  'Reprovado': 'bg-red-100 text-red-800',
  'Bloqueado': 'bg-orange-100 text-orange-800',
}

// ✅ Prioridades atualizadas para os valores do banco
const priorityColors: Record<string, string> = {
  'Baixa': 'bg-blue-50 text-blue-700',
  'Média': 'bg-yellow-50 text-yellow-700',
  'Alta': 'bg-orange-50 text-orange-700',
  'Crítica': 'bg-red-50 text-red-700',
}

export function TestCasesList({ refreshTrigger, onEdit }: TestCasesListProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [periodo, setPeriodo] = useState('')

  useEffect(() => {
    fetchTestCases()
  }, [refreshTrigger, status, periodo])

  const fetchTestCases = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (periodo) params.append('periodo', periodo)

      const response = await fetch(`/api/test-cases?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTestCases(data)
      } else {
        toast.error('Erro ao carregar casos de teste')
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

        {/* ✅ Filtros */}
        <div className="flex gap-4 flex-wrap">

          {/* Filtro Status */}
          <div className="w-44">
            <Select
              value={status || 'all'}
              onValueChange={(value) => setStatus(value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Reprovado">Reprovado</SelectItem>
                <SelectItem value="Bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Período */}
          <div className="w-44">
            <Select
              value={periodo || 'all'}
              onValueChange={(value) => setPeriodo(value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="90dias">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ✅ Tabela */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((testCase) => (
                  <TableRow key={testCase.id}>

                    {/* ✅ Corrigido: title (não titulo) */}
                    <TableCell className="font-medium">
                      {testCase.title}
                    </TableCell>

                    {/* ✅ Corrigido: type (não tipo_teste) */}
                    <TableCell>{testCase.type || '-'}</TableCell>

                    {/* ✅ Status com badge colorido */}
                    <TableCell>
                      <Badge className={statusColors[testCase.status] ?? 'bg-gray-100 text-gray-800'}>
                        {testCase.status ?? '-'}
                      </Badge>
                    </TableCell>

                    {/* ✅ Priority com badge colorido */}
                    <TableCell>
                      <Badge className={priorityColors[testCase.priority] ?? 'bg-gray-100 text-gray-800'}>
                        {testCase.priority ?? '-'}
                      </Badge>
                    </TableCell>

                    {/* ✅ Data formatada */}
                    <TableCell>
                      {testCase.created_at
                        ? new Date(testCase.created_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>

                    {/* ✅ Ações */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/test-cases/${testCase.id}`}>
                          <Button variant="ghost" size="sm" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Editar"
                          onClick={() => onEdit?.(testCase)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Deletar"
                          onClick={() => deleteTestCase(testCase.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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