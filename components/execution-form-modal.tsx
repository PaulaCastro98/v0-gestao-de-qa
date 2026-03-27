// C:\Users\paula.castro\Desktop\projeto-qa\v0-gestao-de-qa\components\execution-form-modal.tsx
'use client'

import { useState, useEffect } from 'react'
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
import { useToast } from '@/hooks/use-toast'

// Definição da interface para a execução de teste (ALINHADA COM O SCHEMA DO DB)
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
}

interface ExecutionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  execution?: TestExecution // Para edição
  onSave: () => void // Callback para quando uma execução é salva
}

const initialFormData: Partial<TestExecution> = {
  feature: '',
  historia_git: '',
  story_points: 1,
  sprint: '',
  status_hu: 'To Do',
  tc_id: '',
  titulo_tc: '',
  tipo_teste: 'E2E',
  status_teste: 'Not Executed',
  resultado_esperado: '',
  passos: '',
  requisitos: '',
  regra: '',
  prioridade_teste: 'Média',
  criticidade_defeito: '',
  ambiente: 'Dev',
  bug_id: '',
  reaberto: 'Não',
  problemas_historia: '',
  problemas_ux_ui: '',
  status_automacao: 'Não Automatizado',
  flaky: 'Não',
  observacoes: '',
  evidencia_url: '',
  assigned_to: '',
}

export function ExecutionFormModal({
  open,
  onOpenChange,
  execution,
  onSave,
}: ExecutionFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<TestExecution>>(initialFormData)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (execution) {
      setFormData(execution)
    } else {
      setFormData(initialFormData)
    }
  }, [execution, open])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo_tc) {
      toast({
        title: 'Erro',
        description: 'O campo Título TC é obrigatório',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    // Construir o payload com os nomes de campos e tipos corretos para a API
    const payload: Partial<TestExecution> = {
      feature: feature === '' ? null : feature,
      historia_git: historiaGit === '' ? null : historiaGit,
      story_points: storyPoints,
      sprint: sprint === '' ? null : sprint,
      status_hu: statusHu,
      tc_id: tcId === '' ? null : tcId,
      titulo_tc: tituloTc, // NOVO, OBRIGATÓRIO
      tipo_teste: tipoTeste,
      status_teste: statusTeste,
      prioridade_teste: prioridadeTeste, // NOVO, OBRIGATÓRIO
      // Mapeia 'none' de volta para null para a API
      criticidade_defeito: criticidadeDefeito === 'none' ? null : criticidadeDefeito,
      ambiente: ambiente, // JÁ DEVE ESTAR EM MAIÚSCULAS
      bug_id: bugId === '' ? null : bugId,
      reaberto: reaberto ? 'Sim' : 'Não', // Converte boolean para 'Sim'/'Não'
      status_automacao: statusAutomacao, // NOVO, OBRIGATÓRIO
      flaky: flaky ? 'Sim' : 'Não', // Converte boolean para 'Sim'/'Não'
      observacoes: observacoes === '' ? null : observacoes, // Mapeado de insights_qa
    }

    // ADICIONADO PARA DEPURAR O PAYLOAD FINAL
    console.log('Payload enviado do frontend (detalhado):', payload);

    try {
      const url = execution
        ? `/api/test-executions/${execution.id}`
        : '/api/test-executions'
      const method = execution ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Envia o payload construído
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar')
      }

      toast({
        title: 'Sucesso',
        description: execution ? 'Execução atualizada' : 'Execução criada',
      })
      onOpenChange(false)
      onSave()
      router.refresh() // Atualiza a página após salvar
    } catch (error: any) {
      console.error('Erro ao salvar execução:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar execução',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{execution ? 'Editar Execução de Teste' : 'Nova Execução de Teste'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da execução do teste. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção: Feature / História */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Feature / História</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature">Feature</Label>
                <Input
                  id="feature"
                  value={formData.feature || ''}
                  onChange={(e) => handleChange('feature', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="historia_git">História Git</Label>
                <Input
                  id="historia_git"
                  value={formData.historia_git || ''}
                  onChange={(e) => handleChange('historia_git', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story_points">Story Points</Label>
                <Input
                  id="story_points"
                  type="number"
                  min="1"
                  value={formData.story_points || 1}
                  onChange={(e) => handleChange('story_points', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint">Sprint</Label>
                <Input
                  id="sprint"
                  value={formData.sprint || ''}
                  onChange={(e) => handleChange('sprint', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status_hu">Status HU</Label>
                <Select value={formData.status_hu || 'To Do'} onValueChange={(value) => handleChange('status_hu', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Responsável</Label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={(e) => handleChange('assigned_to', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Seção: Caso de Teste */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Caso de Teste</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tc_id">TC ID</Label>
                <Input
                  id="tc_id"
                  value={formData.tc_id || ''}
                  onChange={(e) => handleChange('tc_id', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo_tc">Título TC *</Label>
                <Input
                  id="titulo_tc"
                  value={formData.titulo_tc || ''}
                  onChange={(e) => handleChange('titulo_tc', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_teste">Tipo de Teste</Label>
                <Select value={formData.tipo_teste || 'E2E'} onValueChange={(value) => handleChange('tipo_teste', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unit">Unit</SelectItem>
                    <SelectItem value="Integration">Integration</SelectItem>
                    <SelectItem value="E2E">E2E</SelectItem>
                    <SelectItem value="Smoke">Smoke</SelectItem>
                    <SelectItem value="Regression">Regression</SelectItem>
                    <SelectItem value="Exploratory">Exploratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status_teste">Status do Teste</Label>
                <Select value={formData.status_teste || 'Not Executed'} onValueChange={(value) => handleChange('status_teste', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Executed">Not Executed</SelectItem>
                    <SelectItem value="Pass">Pass</SelectItem>
                    <SelectItem value="Fail">Fail</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prioridade_teste">Prioridade</Label>
                <Select value={formData.prioridade_teste || 'Média'} onValueChange={(value) => handleChange('prioridade_teste', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ambiente">Ambiente</Label>
                <Select value={formData.ambiente || 'Dev'} onValueChange={(value) => handleChange('ambiente', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dev">Dev</SelectItem>
                    <SelectItem value="Homolog">Homolog</SelectItem>
                    <SelectItem value="Produção">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passos">Passos</Label>
              <Textarea
                id="passos"
                value={formData.passos || ''}
                onChange={(e) => handleChange('passos', e.target.value)}
                placeholder="Descreva os passos do teste"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resultado_esperado">Resultado Esperado</Label>
              <Textarea
                id="resultado_esperado"
                value={formData.resultado_esperado || ''}
                onChange={(e) => handleChange('resultado_esperado', e.target.value)}
              />
            </div>
          </div>

          {/* Seção: Bug */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Bug</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bug_id">Bug ID</Label>
                <Input
                  id="bug_id"
                  value={formData.bug_id || ''}
                  onChange={(e) => handleChange('bug_id', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criticidade_defeito">Criticidade Defeito</Label>
                <Select value={formData.criticidade_defeito || 'none'} onValueChange={(value) => handleChange('criticidade_defeito', value === 'none' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="P0-Crítico">P0-Crítico</SelectItem>
                    <SelectItem value="P1-Alto">P1-Alto</SelectItem>
                    <SelectItem value="P2-Médio">P2-Médio</SelectItem>
                    <SelectItem value="P3-Baixo">P3-Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reaberto">Reaberto</Label>
                <Select value={formData.reaberto || 'Não'} onValueChange={(value) => handleChange('reaberto', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Sim">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Seção: QA Insights */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">QA Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="problemas_historia">Problemas na História</Label>
                <Textarea
                  id="problemas_historia"
                  value={formData.problemas_historia || ''}
                  onChange={(e) => handleChange('problemas_historia', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="problemas_ux_ui">Problemas UX/UI</Label>
                <Textarea
                  id="problemas_ux_ui"
                  value={formData.problemas_ux_ui || ''}
                  onChange={(e) => handleChange('problemas_ux_ui', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Seção: Automação */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Automação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status_automacao">Status Automação</Label>
                <Select value={formData.status_automacao || 'Não Automatizado'} onValueChange={(value) => handleChange('status_automacao', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não Automatizado">Não Automatizado</SelectItem>
                    <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                    <SelectItem value="Automatizado">Automatizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flaky">Flaky</Label>
                <Select value={formData.flaky || 'Não'} onValueChange={(value) => handleChange('flaky', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Sim">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Seção: Observações */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Extra</h3>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => handleChange('observacoes', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evidencia_url">URL da Evidência</Label>
              <Input
                id="evidencia_url"
                value={formData.evidencia_url || ''}
                onChange={(e) => handleChange('evidencia_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
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