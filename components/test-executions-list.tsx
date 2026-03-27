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
  feature: string | null
  historia_git: string | null
  story_points: number
  sprint: string | null
  status_hu: string
  tc_id: string | null
  titulo_tc: string
  tipo_teste: string
  status_teste: string
  resultado_esperado: string | null
  passos: string | null
  requisitos: string | null
  regra: string | null
  prioridade_teste: string
  criticidade_defeito: string | null
  ambiente: string
  bug_id: string | null
  reaberto: string
  problemas_historia: string | null
  problemas_ux_ui: string | null
  status_automacao: string
  flaky: string
  observacoes: string | null
  evidencia_url: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

interface TestExecutionsListProps {
  onEdit: (execution: TestExecution) => void
  onNew: () => void
}

const statusColors: Record<string, string> = {
  'Pass': 'bg-green-100 text-green-800',
  'Fail': 'bg-red-100 text-red-800',
  'Blocked': 'bg-yellow-100 text-yellow-800',
  'Not Executed': 'bg-gray-100 text-gray-800',
}

const prioridadeColors: Record<string, string> = {
  'Alta': 'bg-red-100 text-red-800',
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

      const uniqueSprints = [...new Set(data.map((e: TestExecution) => e.sprint).filter(Boolean))]
      setSprints(uniqueSprints.sort() as string[])
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao buscar execuções', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta execução?')) return

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
      'TC ID',
      'Título',
      'Feature',
      'História Git',
      'Story Points',
      'Sprint',
      'Status HU',
      'Tipo Teste',
      'Status Teste',
      'Prioridade',
      'Ambiente',
      'Bug ID',
      'Criticidade Defeito',
      'Automação',
      'Flaky',
      'Responsável',
    ]

    const rows = executions.map((e) => [
      e.tc_id || '',
      e.titulo_tc,
      e.feature || '',
      e.historia_git || '',
      e.story_points,
      e.sprint || '',
      e.status_hu,
      e.tipo_teste,
      e.status_teste,
      e.prioridade_teste,
      e.ambiente,
      e.bug_id || '',
      e.criticidade_defeito || '',
      e.status_automacao,
      e.flaky,
      e.assigned_to || '',
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
          <Select value={sprint || 'all'} onValueChange={(value) => setSprint(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-48">
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
            Nova Execucao
          </Button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TC ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ambiente</TableHead>
              <TableHead>Automação</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : executions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhuma execucao registrada. Clique em &quot;Nova Execucao&quot; para comecar.
                </TableCell>
              </TableRow>
            ) : (
              executions.map((exec) => (
                <TableRow key={exec.id}>
                  <TableCell className="font-mono text-sm">{exec.tc_id || '-'}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {exec.titulo_tc}
                  </TableCell>
                  <TableCell>
                    {exec.sprint ? (
                      <Badge variant="outline">{exec.sprint}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[exec.status_teste] || 'bg-gray-100'}>
                      {exec.status_teste}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={prioridadeColors[exec.prioridade_teste] || 'bg-gray-100'}>
                      {exec.prioridade_teste}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{exec.tipo_teste}</TableCell>
                  <TableCell className="text-sm">{exec.ambiente}</TableCell>
                  <TableCell>
                    <Badge variant={exec.status_automacao === 'Automatizado' ? 'default' : 'secondary'}>
                      {exec.status_automacao === 'Automatizado' ? 'Auto' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        onClick={() => onEdit(exec)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(exec.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
