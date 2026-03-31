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
import { useRouter } from 'next/navigation'

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
  tipo_teste: 'E2E', // Valor padrão alinhado com o DB
  status_teste: 'Not Executed', // Valor padrão alinhado com o DB
  resultado_esperado: '',
  passos: '',
  requisitos: '',
  regra: '',
  prioridade_teste: 'Média',
  criticidade_defeito: null, // Pode ser null
  ambiente: 'Dev', // Valor padrão alinhado com o DB
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
<<<<<<< HEAD
=======
  const [loading, setLoading] = useState(false)
>>>>>>> v0/paulacastro98-9472fa1e
  const [formData, setFormData] = useState<Partial<TestExecution>>(initialFormData)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setFormData(execution || initialFormData)
    }
  }, [open, execution])

  const handleChange = (field: keyof TestExecution, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
<<<<<<< HEAD
    setLoading(true)

    try {
      const method = execution ? 'PUT' : 'POST'
      const url = execution ? `/api/test-executions/${execution.id}` : '/api/test-executions'

      // Ajuste para garantir que criticidade_defeito seja null se 'none' for selecionado
      const payload = {
        ...formData,
        criticidade_defeito: formData.criticidade_defeito === 'none' ? null : formData.criticidade_defeito,
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Erro da API:', errorData)
        toast({
          title: 'Erro ao salvar execução',
          description: errorData.details
            ? JSON.stringify(errorData.details)
            : errorData.error || 'Ocorreu um erro inesperado.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Sucesso!',
        description: `Execução ${execution ? 'atualizada' : 'criada'} com sucesso.`,
      })
      onOpenChange(false) // Fecha o modal
      onSave() // Atualiza a lista de execuções
      router.refresh() // Recarrega a página para buscar os dados atualizados
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      toast({
        title: 'Erro',
        description: (error as Error).message || 'Ocorreu um erro inesperado.',
=======

    if (!formData.titulo_tc) {
      toast({
        title: 'Erro',
        description: 'O campo Título TC é obrigatório',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    // Desestruturar formData para acessar as variáveis diretamente
    const {
      feature, historia_git, story_points, sprint, status_hu, tc_id,
      titulo_tc, tipo_teste, status_teste, resultado_esperado, passos,
      requisitos, regra, prioridade_teste, criticidade_defeito, ambiente,
      bug_id, reaberto, problemas_historia, problemas_ux_ui,
      status_automacao, flaky, observacoes, evidencia_url, assigned_to
    } = formData

    // Construir o payload com os nomes de campos e tipos corretos para a API
    const payload: Partial<TestExecution> = {
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
      flaky: flaky,
      observacoes: observacoes === '' ? null : observacoes,
      evidencia_url: evidencia_url === '' ? null : evidencia_url,
      assigned_to: assigned_to === '' ? null : assigned_to,
    }

    try {
      const url = execution ? `/api/test-executions/${execution.id}` : '/api/test-executions'
      const method = execution ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erro ao salvar execução de teste')
      }

      toast({
        title: 'Sucesso!',
        description: `Execução de teste ${execution ? 'atualizada' : 'criada'} com sucesso.`,
      })
      onSave() // Chama o callback para atualizar a lista
      onOpenChange(false) // Fecha o modal
      router.refresh() // Atualiza a página para refletir as mudanças
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro inesperado.',
>>>>>>> v0/paulacastro98-9472fa1e
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
          <DialogTitle>{execution ? 'Editar Execução de Teste' : 'Nova Execução de Teste'}</DialogTitle>
          <DialogDescription>
<<<<<<< HEAD
            {execution
              ? 'Edite os detalhes da execução de teste existente.'
              : 'Preencha os detalhes para criar uma nova execução de teste.'}
=======
            {execution ? 'Edite os detalhes da execução de teste.' : 'Preencha os detalhes para uma nova execução de teste.'}
>>>>>>> v0/paulacastro98-9472fa1e
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Seção: Detalhes da História */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detalhes da História</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature">Feature</Label>
                <Input
                  id="feature"
                  value={formData.feature || ''}
                  onChange={(e) => handleChange('feature', e.target.value)}
                  placeholder="Ex: Login de Usuário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="historia_git">História Git</Label>
                <Input
                  id="historia_git"
                  value={formData.historia_git || ''}
                  onChange={(e) => handleChange('historia_git', e.target.value)}
<<<<<<< HEAD
                  placeholder="Ex: US-123"
=======
                  placeholder="Ex: HU-1234"
>>>>>>> v0/paulacastro98-9472fa1e
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="status_hu">Status HU</Label>
              <Select value={formData.status_hu || 'To Do'} onValueChange={(value) => handleChange('status_hu', value)}>
                <SelectTrigger>
<<<<<<< HEAD
                  <SelectValue placeholder="Selecione o status da HU" />
=======
                  <SelectValue />
>>>>>>> v0/paulacastro98-9472fa1e
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
<<<<<<< HEAD
                  <SelectItem value="Blocked">Blocked</SelectItem>
=======
>>>>>>> v0/paulacastro98-9472fa1e
                </SelectContent>
              </Select>
            </div>
          </div>

<<<<<<< HEAD
          {/* Seção: Detalhes do Caso de Teste */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detalhes do Caso de Teste</h3>
=======
          {/* Seção: Detalhes do Teste */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detalhes do Teste</h3>
>>>>>>> v0/paulacastro98-9472fa1e
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="titulo_tc">Título TC <span className="text-red-500">*</span></Label>
                <Input
                  id="titulo_tc"
                  value={formData.titulo_tc || ''}
                  onChange={(e) => handleChange('titulo_tc', e.target.value)}
                  placeholder="Ex: Verificar login com credenciais válidas"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_teste">Tipo de Teste</Label>
                <Select value={formData.tipo_teste || 'E2E'} onValueChange={(value) => handleChange('tipo_teste', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de teste" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* ATENÇÃO: Estes valores devem ser EXATAMENTE iguais aos da API e DB */}
                    <SelectItem value="E2E">E2E</SelectItem>
<<<<<<< HEAD
                    <SelectItem value="Unit">Unitário</SelectItem>
                    <SelectItem value="Integration">Integração</SelectItem>
                    <SelectItem value="Smoke">Smoke</SelectItem>
                    <SelectItem value="Regression">Regressão</SelectItem>
                    <SelectItem value="Exploratory">Exploratório</SelectItem>
=======
                    <SelectItem value="Funcional">Funcional</SelectItem>
                    <SelectItem value="Regressão">Regressão</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
>>>>>>> v0/paulacastro98-9472fa1e
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status_teste">Status do Teste</Label>
                <Select value={formData.status_teste || 'Not Executed'} onValueChange={(value) => handleChange('status_teste', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* ATENÇÃO: Estes valores devem ser EXATAMENTE iguais aos da API e DB */}
                    <SelectItem value="Not Executed">Não Executado</SelectItem>
                    <SelectItem value="Pass">Passou</SelectItem>
                    <SelectItem value="Fail">Falhou</SelectItem>
                    <SelectItem value="Blocked">Bloqueado</SelectItem>
                    <SelectItem value="Skipped">Ignorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resultado_esperado">Resultado Esperado</Label>
              <Textarea
                id="resultado_esperado"
                value={formData.resultado_esperado || ''}
                onChange={(e) => handleChange('resultado_esperado', e.target.value)}
<<<<<<< HEAD
=======
                placeholder="Ex: O usuário deve ser redirecionado para o dashboard."
>>>>>>> v0/paulacastro98-9472fa1e
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passos">Passos</Label>
              <Textarea
                id="passos"
                value={formData.passos || ''}
                onChange={(e) => handleChange('passos', e.target.value)}
<<<<<<< HEAD
=======
                placeholder="1. Abrir navegador&#10;2. Acessar URL&#10;3. Inserir credenciais"
>>>>>>> v0/paulacastro98-9472fa1e
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requisitos">Requisitos</Label>
                <Textarea
                  id="requisitos"
                  value={formData.requisitos || ''}
                  onChange={(e) => handleChange('requisitos', e.target.value)}
<<<<<<< HEAD
=======
                  placeholder="Ex: O sistema deve permitir login."
>>>>>>> v0/paulacastro98-9472fa1e
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regra">Regra</Label>
                <Textarea
                  id="regra"
                  value={formData.regra || ''}
                  onChange={(e) => handleChange('regra', e.target.value)}
<<<<<<< HEAD
=======
                  placeholder="Ex: Regra de negócio X"
>>>>>>> v0/paulacastro98-9472fa1e
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridade_teste">Prioridade do Teste</Label>
                <Select value={formData.prioridade_teste || 'Média'} onValueChange={(value) => handleChange('prioridade_teste', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
<<<<<<< HEAD
=======
              </div>
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
>>>>>>> v0/paulacastro98-9472fa1e
              </div>
            </div>
          </div>

          {/* Seção: Ambiente e Bug */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ambiente e Bug</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="criticidade_defeito">Criticidade do Defeito</Label>
                <Select value={formData.criticidade_defeito || 'none'} onValueChange={(value) => handleChange('criticidade_defeito', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a criticidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não Aplicável</SelectItem> {/* Valor para enviar null */}
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Seção: Ambiente e Bug */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ambiente e Bug</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ambiente">Ambiente</Label>
                <Select value={formData.ambiente || 'Dev'} onValueChange={(value) => handleChange('ambiente', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* ATENÇÃO: Estes valores devem ser EXATAMENTE iguais aos da API e DB */}
                    <SelectItem value="Dev">Dev</SelectItem>
                    <SelectItem value="QA">QA</SelectItem> {/* Adicionado 'QA' */}
                    <SelectItem value="Staging">Staging</SelectItem> {/* Corrigido para 'Staging' */}
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
                  placeholder="Ex: BUG-456"
                />
              </div>
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