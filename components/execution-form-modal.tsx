'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
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
}

interface ExecutionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  execution?: TestExecution
  onSave: () => void
}

export function ExecutionFormModal({
  open,
  onOpenChange,
  execution,
  onSave,
}: ExecutionFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<TestExecution>>(
    execution || {
      feature: '',
      historia_git: '',
      story_points: 0,
      sprint: '',
      status_hu: '',
      tc_id: '',
      tipo_teste: '',
      status_teste: '',
      bug_id: '',
      criticidade: '',
      ambiente: '',
      insights_qa: '',
      automacao: false,
      flaky: false,
    }
  )
  const { toast } = useToast()

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = execution
        ? `/api/test-executions/${execution.id}`
        : '/api/test-executions'
      const method = execution ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erro ao salvar')

      toast({
        title: 'Sucesso',
        description: execution ? 'Execução atualizada' : 'Execução criada',
      })
      onOpenChange(false)
      onSave()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar execução',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {execution ? 'Editar Execução' : 'Nova Execução de Teste'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da execução de teste
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feature">Feature</Label>
              <Input
                id="feature"
                value={formData.feature || ''}
                onChange={(e) => handleChange('feature', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="historia_git">História Git</Label>
              <Input
                id="historia_git"
                value={formData.historia_git || ''}
                onChange={(e) => handleChange('historia_git', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story_points">Story Points</Label>
              <Input
                id="story_points"
                type="number"
                value={formData.story_points || 0}
                onChange={(e) => handleChange('story_points', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint">Sprint</Label>
              <Input
                id="sprint"
                value={formData.sprint || ''}
                onChange={(e) => handleChange('sprint', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tc_id">TC ID</Label>
              <Input
                id="tc_id"
                value={formData.tc_id || ''}
                onChange={(e) => handleChange('tc_id', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_hu">Status HU</Label>
              <Select value={formData.status_hu || ''} onValueChange={(value) => handleChange('status_hu', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_teste">Tipo de Teste</Label>
              <Select value={formData.tipo_teste || ''} onValueChange={(value) => handleChange('tipo_teste', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funcional">Funcional</SelectItem>
                  <SelectItem value="Regressão">Regressão</SelectItem>
                  <SelectItem value="Integração">Integração</SelectItem>
                  <SelectItem value="Smoke">Smoke</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_teste">Status do Teste</Label>
              <Select value={formData.status_teste || ''} onValueChange={(value) => handleChange('status_teste', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Passou">Passou</SelectItem>
                  <SelectItem value="Falhou">Falhou</SelectItem>
                  <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                  <SelectItem value="Skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticidade">Criticidade</Label>
              <Select value={formData.criticidade || ''} onValueChange={(value) => handleChange('criticidade', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ambiente">Ambiente</Label>
              <Select value={formData.ambiente || ''} onValueChange={(value) => handleChange('ambiente', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEV">DEV</SelectItem>
                  <SelectItem value="QA">QA</SelectItem>
                  <SelectItem value="STAGING">STAGING</SelectItem>
                  <SelectItem value="PRODUÇÃO">PRODUÇÃO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug_id">Bug ID</Label>
              <Input
                id="bug_id"
                value={formData.bug_id || ''}
                onChange={(e) => handleChange('bug_id', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insights_qa">Insights QA</Label>
            <Textarea
              id="insights_qa"
              value={formData.insights_qa || ''}
              onChange={(e) => handleChange('insights_qa', e.target.value)}
              placeholder="Observações e insights da execução"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="automacao"
                checked={formData.automacao || false}
                onCheckedChange={(checked) => handleChange('automacao', checked)}
              />
              <Label htmlFor="automacao" className="cursor-pointer">
                Teste Automatizado
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="flaky"
                checked={formData.flaky || false}
                onCheckedChange={(checked) => handleChange('flaky', checked)}
              />
              <Label htmlFor="flaky" className="cursor-pointer">
                Teste Flaky
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
