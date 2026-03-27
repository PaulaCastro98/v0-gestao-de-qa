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
import { useRouter } from 'next/navigation' // ADICIONADO: Importação do useRouter

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
  const [loading, setLoading] = useState(false) // MANTENHA ESTA DECLARAÇÃO (linha 96)
  const [formData, setFormData] = useState<Partial<TestExecution>>(initialFormData)
  const { toast } = useToast()
  // REMOVA A LINHA ABAIXO (linha 99, que era a duplicada):
  // const [loading, setLoading] = useState(false)

  const router = useRouter() // ADICIONADO: Inicialize o useRouter aqui

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

// ADICIONADO: Desestruturar formData para acessar as variáveis diretamente
const {
  feature, historia_git, story_points, sprint, status_hu, tc_id,
  titulo_tc, tipo_teste, status_teste, resultado_esperado, passos,
  requisitos, regra, prioridade_teste, criticidade_defeito, ambiente,
  bug_id, reaberto, problemas_historia, problemas_ux_ui,
  status_automacao, flaky, observacoes, evidencia_url, assigned_to
} = formData

// Construir o payload com os nomes de campos e tipos corretos para a API
const payload: Partial&lt;TestExecution&gt; = {
  feature: feature === '' ? null : feature,
  historia_git: historia_git === '' ? null : historia_git,
  story_points: story_points,
  sprint: sprint === '' ? null : sprint,
  status_hu: status_hu,
  tc_id: tc_id === '' ? null : tc_id,
  titulo_tc: titulo_tc,
  tipo_teste: tipo_teste,
  status_teste: status_teste,
  resultado_esperado: resultado_esperado === '' ? null : resultado_esperado,
  passos: passos === '' ? null : passos,
  requisitos: requisitos === '' ? null : requisitos,
  regra: regra === '' ? null : regra,
  prioridade_teste: prioridade_teste,
  criticidade_defeito: criticidade_defeito === 'none' ? null : criticidade_defeito,
  ambiente: ambiente,
  bug_id: bug_id === '' ? null : bug_id,
  reaberto: reaberto, // Já é string 'Sim'/'Não'
  problemas_historia: problemas_historia === '' ? null : problemas_historia,
  problemas_ux_ui: problemas_ux_ui === '' ? null : problemas_ux_ui,
  status_automacao: status_automacao,
  flaky: flaky, // Já é string 'Sim'/'Não'
  observacoes: observacoes === '' ? null : observacoes,
  evidencia_url: evidencia_url === '' ? null : evidencia_url,
  assigned_to: assigned_to === '' ? null : assigned_to,
}

// ADICIONADO PARA DEPURAR O PAYLOAD FINAL
console.log('Payload final:', payload)

try {
  const url = execution?.id
    ? `/api/executions/${execution.id}`
    : '/api/executions'
  const method = execution?.id ? 'PUT' : 'POST'

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Erro ao salvar execução')
  }

  toast({
    title: 'Sucesso!',
    description: `Execução ${execution?.id ? 'atualizada' : 'criada'} com sucesso.`,
  })
  onSave() // Chama o callback para atualizar a lista
  onOpenChange(false) // Fecha o modal
  router.refresh() // Atualiza a página para mostrar os novos dados
} catch (error: any) {
  console.error('Erro ao salvar execução:', error)
  toast({
    title: 'Erro',
    description: error.message || 'Ocorreu um erro inesperado.',
    variant: 'destructive',
  })
} finally {
  setLoading(false)
}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{execution ? 'Editar Execução' : 'Nova Execução'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da execução de teste.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção: Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature">Feature</Label>
                <Input
                  id="feature"
                  value={formData.feature || ''}
                  onChange={(e) => handleChange('feature', e.target.value)}
                  placeholder="Ex: Login, Cadastro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="historia_git">História Git</Label>
                <Input
                  id="historia_git"
                  value={formData.historia_git || ''}
                  onChange={(e) => handleChange('historia_git', e.target.value)}
                  placeholder="Ex: #12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story_points">Story Points</Label>
                <Input
                  id="story_points"
                  type="number"
                  value={formData.story_points || 1}
                  onChange={(e) => handleChange('story_points', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint">Sprint</Label>
                <Input
                  id="sprint"
                  value={formData.sprint || ''}
                  onChange={(e) => handleChange('sprint', e.target.value)}
                  placeholder="Ex: Sprint 1"
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
                <Label htmlFor="tc_id">TC ID</Label>
                <Input
                  id="tc_id"
                  value={formData.tc_id || ''}
                  onChange={(e) => handleChange('tc_id', e.target.value)}
                  placeholder="Ex: TC-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo_tc">Título TC</Label>
                <Input
                  id="titulo_tc"
                  value={formData.titulo_tc || ''}
                  onChange={(e) => handleChange('titulo_tc', e.target.value)}
                  placeholder="Ex: Verificar login com credenciais válidas"
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
                    <SelectItem value="E2E">E2E</SelectItem>
                    <SelectItem value="Unitário">Unitário</SelectItem>
                    <SelectItem value="Integração">Integração</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
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
                    <SelectItem value="Not Executed">Não Executado</SelectItem>
                    <SelectItem value="Passed">Passou</SelectItem>
                    <SelectItem value="Failed">Falhou</SelectItem>
                    <SelectItem value="Blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prioridade_teste">Prioridade do Teste</Label>
                <Select value={formData.prioridade_teste || 'Média'} onValueChange={(value) => handleChange('prioridade_teste', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </Select>
              <div className="space-y-2">
                <Label htmlFor="criticidade_defeito">Criticidade do Defeito</Label>
                <Select value={formData.criticidade_defeito || 'none'} onValueChange={(value) => handleChange('criticidade_defeito', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
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
                    <SelectItem value="Homologação">Homologação</SelectItem>
                    <SelectItem value="Produção">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bug_id">Bug ID</Label>
                <Input
                  id="bug_id"
                  value={formData.bug_id || ''}
                  onChange={(e) => handleChange('bug_id', e.target.value)}
                  placeholder="Ex: BUG-001"
                />
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
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Atribuído a</Label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={(e) => handleChange('assigned_to', e.target.value)}
                  placeholder="Nome do QA"
                />
              </div>
            </div>
          </div>
      {/* Seção: Detalhes do Teste */}
      &lt;div className="space-y-4"&gt;
        &lt;h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"&gt;Detalhes do Teste&lt;/h3&gt;
        &lt;div className="grid grid-cols-1 gap-4"&gt;
          &lt;div className="space-y-2"&gt;
            &lt;Label htmlFor="resultado_esperado"&gt;Resultado Esperado&lt;/Label&gt;
            &lt;Textarea
              id="resultado_esperado"
              value={formData.resultado_esperado || ''}
              onChange={(e) =&gt; handleChange('resultado_esperado', e.target.value)}
            /&gt;
          &lt;/div&gt;
          &lt;div className="space-y-2"&gt;
            &lt;Label htmlFor="passos"&gt;Passos&lt;/Label&gt;
            &lt;Textarea
              id="passos"
              value={formData.passos || ''}
              onChange={(e) =&gt; handleChange('passos', e.target.value)}
            /&gt;
          &lt;/div&gt;
          &lt;div className="space-y-2"&gt;
            &lt;Label htmlFor="requisitos"&gt;Requisitos&lt;/Label&gt;
            &lt;Textarea
              id="requisitos"
              value={formData.requisitos || ''}
              onChange={(e) =&gt; handleChange('requisitos', e.target.value)}
            /&gt;
          &lt;/div&gt;
          &lt;div className="space-y-2"&gt;
            &lt;Label htmlFor="regra"&gt;Regra de Negócio&lt;/Label&gt;
            &lt;Textarea
              id="regra"
              value={formData.regra || ''}
              onChange={(e) =&gt; handleChange('regra', e.target.value)}
            /&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Seção: QA Insights */}
      &lt;div className="space-y-4"&gt;
        &lt;h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"&gt;QA Insights&lt;/h3&gt;
        &lt;div className="grid grid-cols-2 gap-4"&gt;
          &lt;div className="space-y-2"&gt;
            &lt;Label htmlFor="problemas_historia"&gt;Problemas na História&lt;/Label&gt;
            &lt;Textarea
              id="problemas_historia"
              value={formData.problemas_historia || ''}
              onChange={(e) =&gt; handleChange('problemas_historia', e.target.value)}
            /&gt;
          &lt;/div&gt;
          &lt;div className="space-y-2"&gt;
            &lt;Label htmlFor="problemas_ux_ui"&gt;Problemas UX/UI&lt;/Label&gt;
            &lt;Textarea
              id="problemas_ux_ui"
              value={formData.problemas_ux_ui || ''}
              onChange={(e) =&gt; handleChange('problemas_ux_ui', e.target.value)}
            /&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Seção: Automação */}
      &lt;div className="space-y-4"&gt;
        &lt;h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"&gt;Automação&lt;/h3&gt;
        &lt;div className="grid grid-cols-2 gap-4"&gt;
          &lt;div className="space-y-2"&gt;
            &lt;Label htmlFor="status_automacao"&gt;Status Automação&lt;/Label&gt;
            &lt;Select value={formData.status_automacao || 'Não Automatizado'} onValueChange={(value) =&gt; handleChange('status_automacao', value)}&gt;
              &lt;SelectTrigger&gt;
                &lt;SelectValue /&gt;
              &lt;/SelectTrigger&gt;
              &lt;SelectContent&gt;
                &lt;SelectItem value="Não Automatizado"&gt;Não Automatizado&lt;/SelectItem&gt;
                &lt;SelectItem value="Em Progresso"&gt;Em Progresso&lt;/SelectItem&gt;
                &lt;SelectItem value="Automatizado"&gt;Automatizado&lt;/SelectItem&gt;
              &lt;/SelectContent&gt;
            &lt;/Select&gt;
          &lt;/div&gt;
          &lt;div className="space-y-2"&gt;
            &lt;Label htmlFor="flaky"&gt;Flaky&lt;/Label&gt;
            &lt;Select value={formData.flaky || 'Não'} onValueChange={(value) =&gt; handleChange('flaky', value)}&gt;
              &lt;SelectTrigger&gt;
                &lt;SelectValue /&gt;
              &lt;/SelectTrigger&gt;
              &lt;SelectContent&gt;
                &lt;SelectItem value="Não"&gt;Não&lt;/SelectItem&gt;
                &lt;SelectItem value="Sim"&gt;Sim&lt;/SelectItem&gt;
              &lt;/SelectContent&gt;
            &lt;/Select&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Seção: Observações */}
      &lt;div className="space-y-4"&gt;
        &lt;h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"&gt;Extra&lt;/h3&gt;
        &lt;div className="space-y-2"&gt;
          &lt;Label htmlFor="observacoes"&gt;Observações&lt;/Label&gt;
          &lt;Textarea
            id="observacoes"
            value={formData.observacoes || ''}
            onChange={(e) =&gt; handleChange('observacoes', e.target.value)}
          /&gt;
        &lt;/div&gt;
        &lt;div className="space-y-2"&gt;
          &lt;Label htmlFor="evidencia_url"&gt;URL da Evidência&lt;/Label&gt;
          &lt;Input
            id="evidencia_url"
            value={formData.evidencia_url || ''}
            onChange={(e) =&gt; handleChange('evidencia_url', e.target.value)}
            placeholder="https://..."
          /&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="flex justify-end gap-2 pt-4 border-t"&gt;
        &lt;Button
          type="button"
          variant="outline"
          onClick={() =&gt; onOpenChange(false)}
          disabled={loading}
        &gt;
          Cancelar
        &lt;/Button&gt;
        &lt;Button type="submit" disabled={loading}&gt;
          {loading ? 'Salvando...' : 'Salvar'}
        &lt;/Button&gt;
      &lt;/div&gt;
    &lt;/form&gt;
  &lt;/DialogContent&gt;
&lt;/Dialog&gt;
  )
}