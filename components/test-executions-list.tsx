'use client'

import { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Pencil, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TestExecution {
  id: string
  feature: string
  historia_git: string
  story_points: number
  sprint: string
  status_hu: string
  tc_id: string
  tipo_teste: string
  status_teste: string
  bug_id: string | null
  criticidade: string
  ambiente: string
  insights_qa: string | null
  automacao: boolean
  flaky: boolean
  created_at: string
  updated_at: string
}

interface TestExecutionsListProps {
  onEdit: (execution: TestExecution) => void
  onNew: () => void
}

const statusColors: Record<string, string> = {
  'Passou': 'bg-green-100 text-green-800',
  'Falhou': 'bg-red-100 text-red-800',
  'Bloqueado': 'bg-yellow-100 text-yellow-800',
  'Skipped': 'bg-gray-100 text-gray-800',
}

const criticidadeColors: Record<string, string> = {
  'Crítica': 'bg-red-100 text-red-800',
  'Alta': 'bg-orange-100 text-orange-800',
  'Média': 'bg-yellow-100 text-yellow-800',
  'Baixa': 'bg-blue-100 text-blue-800',
}

export function TestExecutionsList({ onEdit, onNew }: TestExecutionsListProps) {
  const [executions, setExecutions] = useState<TestExecution[]>([])
  const [sprint, setSprint] = useState('')
  const [loading, setLoading] = useState(true)
  const [sprints, setSprints] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchExecutions()
  }, [sprint])

  const fetchExecutions = async () => {
    try {
      setLoading(true)
      const query = sprint ? `?sprint=${sprint}` : ''
      const response = await fetch(`/api/test-executions${query}`)

      if (!response.ok) throw new Error('Erro ao buscar')

      const data = await response.json()
      setExecutions(data)

      const uniqueSprints = [...new Set(data.map((e: TestExecution) => e.sprint))]
      setSprints(uniqueSprints.sort())
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao buscar execuções', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return

    try {
      const response = await fetch(`/api/test-executions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({ title: 'Sucesso', description: 'Execução deletada' })
        fetchExecutions()
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao deletar', variant: 'destructive' })
    }
  }

  const handleExportCSV = () => {
    const headers = [
      'Feature',
      'História Git',
      'Story Points',
      'Sprint',
      'Status HU',
      'TC ID',
      'Tipo Teste',
      'Status Teste',
      'Bug ID',
      'Criticidade',
      'Ambiente',
      'Insights QA',
      'Automação',
      'Flaky',
    ]

    const rows = executions.map((e) => [
      e.feature,
      e.historia_git,
      e.story_points,
      e.sprint,
      e.status_hu,
      e.tc_id,
      e.tipo_teste,
      e.status_teste,
      e.bug_id || '',
      e.criticidade,
      e.ambiente,
      e.insights_qa || '',
      e.automacao ? 'Sim' : 'Não',
      e.flaky ? 'Sim' : 'Não',
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `controle-qa-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={sprint} onValueChange={(value) => setSprint(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por Sprint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Sprints</SelectItem>
              {sprints.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={onNew} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Execução
          </Button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>História</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Status Teste</TableHead>
              <TableHead>Criticidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Automação</TableHead>
              <TableHead>Flaky</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : executions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Nenhuma execução registrada
                </TableCell>
              </TableRow>
            ) : (
              executions.map((exec) => (
                <TableRow key={exec.id}>
                  <TableCell className="font-medium">{exec.feature}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {exec.historia_git}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exec.sprint}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[exec.status_teste] || 'bg-gray-100'}>
                      {exec.status_teste}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={criticidadeColors[exec.criticidade] || 'bg-gray-100'}>
                      {exec.criticidade}
                    </Badge>
                  </TableCell>
                  <TableCell>{exec.tipo_teste}</TableCell>
                  <TableCell>{exec.automacao ? '✓' : '✗'}</TableCell>
                  <TableCell>{exec.flaky ? '⚠️' : '✓'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => onEdit(exec)}
                      variant="ghost"
                      size="sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(exec.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
