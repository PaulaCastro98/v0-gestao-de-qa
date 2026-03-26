// C:\Users\paula.castro\Desktop\projeto-qa\v0-gestao-de-qa\components\execution-form-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

// Definição da interface para a execução de teste (ALINHADA COM O SCHEMA DO DB)
interface TestExecution {
  id?: string // UUID, gerado pelo DB
  feature: string | null
  historia_git: string | null
  story_points: number // INTEGER, NOT NULL, DEFAULT 1
  sprint: string | null
  status_hu: string // VARCHAR(50), NOT NULL, DEFAULT 'To Do'
  tc_id: string | null // VARCHAR(100)
  titulo_tc: string // TEXT, NOT NULL (NOVO)
  tipo_teste: string // VARCHAR(50), NOT NULL, DEFAULT 'E2E'
  status_teste: string // VARCHAR(50), NOT NULL, DEFAULT 'Not Executed'
  prioridade_teste: string // VARCHAR(50), NOT NULL, DEFAULT 'Média' (NOVO)
  criticidade_defeito: string | null // VARCHAR(50) (renomeado de 'criticidade')
  ambiente: string // VARCHAR(50), NOT NULL, DEFAULT 'Dev'
  bug_id: string | null
  reaberto: string // VARCHAR(10), NOT NULL, DEFAULT 'Não' ('Sim'/'Não') (NOVO)
  status_automacao: string // VARCHAR(50), NOT NULL, DEFAULT 'Não Automatizado' (NOVO)
  flaky: string // VARCHAR(10), NOT NULL, DEFAULT 'Não' ('Sim'/'Não')
  observacoes: string | null // TEXT (mapeado de 'insights_qa')
  created_at?: string // TIMESTAMP, gerado pelo DB
  updated_at?: string // TIMESTAMP, gerado pelo DB
}

interface ExecutionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  execution?: TestExecution // Para edição
  onSave: () => void // Callback para quando uma execução é salva
}

export function ExecutionFormModal({
  open,
  onOpenChange,
  execution,
  onSave,
}: ExecutionFormModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Estados individuais para cada campo, com valores padrão alinhados ao DB
  const [feature, setFeature] = useState<string>('')
  const [historiaGit, setHistoriaGit] = useState<string>('')
  const [storyPoints, setStoryPoints] = useState<number>(1) // Default 1
  const [sprint, setSprint] = useState<string>('')
  const [statusHu, setStatusHu] = useState<string>('To Do') // Default 'To Do'
  const [tcId, setTcId] = useState<string>('')
  const [tituloTc, setTituloTc] = useState<string>('') // NOVO, OBRIGATÓRIO
  const [tipoTeste, setTipoTeste] = useState<string>('E2E') // Default 'E2E'
  const [statusTeste, setStatusTeste] = useState<string>('Not Executed') // Default 'Not Executed'
  const [prioridadeTeste, setPrioridadeTeste] = useState<string>('Média') // NOVO, Default 'Média'
  // Alterado para usar 'none' como valor para representar null
  const [criticidadeDefeito, setCriticidadeDefeito] = useState<string | null>(null)
  const [ambiente, setAmbiente] = useState<string>('DEV') // Default 'DEV' (MAIÚSCULAS para chk_ambiente)
  const [bugId, setBugId] = useState<string>('')
  const [reaberto, setReaberto] = useState<boolean>(false) // Checkbox, será 'Sim'/'Não'
  const [statusAutomacao, setStatusAutomacao] = useState<string>('Não Automatizado') // NOVO, Default
  const [flaky, setFlaky] = useState<boolean>(false) // Checkbox, será 'Sim'/'Não'
  const [observacoes, setObservacoes] = useState<string>('') // Mapeado de insights_qa

  // Efeito para popular o formulário quando em modo de edição
  useEffect(() => {
    if (open && execution) { // Só popula se o modal estiver aberto e houver dados de execução
      setFeature(execution.feature || '')
      setHistoriaGit(execution.historia_git || '')
      setStoryPoints(execution.story_points || 1)
      setSprint(execution.sprint || '')
      setStatusHu(execution.status_hu || 'To Do')
      setTcId(execution.tc_id || '')
      setTituloTc(execution.titulo_tc || '')
      setTipoTeste(execution.tipo_teste || 'E2E')
      setStatusTeste(execution.status_teste || 'Not Executed')
      setPrioridadeTeste(execution.prioridade_teste || 'Média')
      // Mapeia null para 'none' para o Select
      setCriticidadeDefeito(execution.criticidade_defeito || 'none')
      setAmbiente(execution.ambiente || 'DEV') // Garante maiúsculas
      setBugId(execution.bug_id || '')
      setReaberto(execution.reaberto === 'Sim')
      setStatusAutomacao(execution.status_automacao || 'Não Automatizado')
      setFlaky(execution.flaky === 'Sim')
      setObservacoes(execution.observacoes || '')
    } else if (!open) { // Resetar formulário ao fechar
        setFeature(''); setHistoriaGit(''); setStoryPoints(1); setSprint('');
        setStatusHu('To Do'); setTcId(''); setTituloTc(''); setTipoTeste('E2E');
        setStatusTeste('Not Executed'); setPrioridadeTeste('Média'); setCriticidadeDefeito(null); // Reseta para null
        setAmbiente('DEV'); setBugId(''); setReaberto(false); setStatusAutomacao('Não Automatizado');
        setFlaky(false); setObservacoes('');
    }
  }, [open, execution]) // Dependências para o useEffect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        const errorData = await response.json();
        // Constrói uma mensagem de erro mais detalhada a partir dos 'details' do backend
        let errorMessage = errorData.error || 'Erro desconhecido ao salvar';
        if (errorData.details) {
          const detailMessages = Object.entries(errorData.details)
            .filter(([, value]) => value !== 'OK')
            .map(([key, value]) => `${key}: ${value}`);
          if (detailMessages.length > 0) {
            errorMessage = `Verifique os campos: ${detailMessages.join(', ')}`;
          }
        }
        throw new Error(errorMessage);
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
        description: error.message || 'Erro ao salvar execução',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{execution ? 'Editar Execução de Teste' : 'Nova Execução de Teste'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da execução do teste. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Feature (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="feature">Feature</Label>
              <Input
                id="feature"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                placeholder="Nome da Feature"
              />
            </div>

            {/* História do Git (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="historia_git">História do Git</Label>
              <Input
                id="historia_git"
                value={historiaGit}
                onChange={(e) => setHistoriaGit(e.target.value)}
                placeholder="Link da História no Git"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Story Points (Obrigatório, Default 1) */}
            <div className="space-y-2">
              <Label htmlFor="story_points">Story Points</Label>
              <Input
                id="story_points"
                type="number"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
                placeholder="Story Points"
                required
                min="0"
              />
            </div>

            {/* Sprint (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="sprint">Sprint</Label>
              <Input
                id="sprint"
                value={sprint}
                onChange={(e) => setSprint(e.target.value)}
                placeholder="Nome da Sprint"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status da HU (Obrigatório, Default 'To Do') */}
            <div className="space-y-2">
              <Label htmlFor="status_hu">Status da HU</Label>
              <Select value={statusHu} onValueChange={setStatusHu} required>
                <SelectTrigger id="status_hu">
                  <SelectValue placeholder="Selecione o Status da HU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="Doing">Doing</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Homologação">Homologação</SelectItem>
                  <SelectItem value="Produção">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TC ID (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="tc_id">TC ID</Label>
              <Input
                id="tc_id"
                value={tcId}
                onChange={(e) => setTcId(e.target.value)}
                placeholder="ID do Caso de Teste"
              />
            </div>
          </div>

          {/* Título do TC (NOVO, Obrigatório) */}
          <div className="space-y-2">
            <Label htmlFor="titulo_tc">Título do Caso de Teste</Label>
            <Input
              id="titulo_tc"
              value={tituloTc}
              onChange={(e) => setTituloTc(e.target.value)}
              placeholder="Título do Caso de Teste"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo de Teste (Obrigatório, Default 'E2E') */}
            <div className="space-y-2">
              <Label htmlFor="tipo_teste">Tipo de Teste</Label>
              <Select value={tipoTeste} onValueChange={setTipoTeste} required>
                <SelectTrigger id="tipo_teste">
                  <SelectValue placeholder="Selecione o Tipo de Teste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E2E">E2E</SelectItem>
                  <SelectItem value="Unitário">Unitário</SelectItem>
                  <SelectItem value="Integração">Integração</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Segurança">Segurança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status do Teste (Obrigatório, Default 'Not Executed') */}
            <div className="space-y-2">
              <Label htmlFor="status_teste">Status do Teste</Label>
              <Select value={statusTeste} onValueChange={setStatusTeste} required>
                <SelectTrigger id="status_teste">
                  <SelectValue placeholder="Selecione o Status do Teste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Executed">Não Executado</SelectItem>
                  <SelectItem value="Pass">Passou</SelectItem>
                  <SelectItem value="Fail">Falhou</SelectItem>
                  <SelectItem value="Blocked">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prioridade do Teste (NOVO, Obrigatório, Default 'Média') */}
            <div className="space-y-2">
              <Label htmlFor="prioridade_teste">Prioridade do Teste</Label>
              <Select value={prioridadeTeste} onValueChange={setPrioridadeTeste} required>
                <SelectTrigger id="prioridade_teste">
                  <SelectValue placeholder="Selecione a Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Criticidade do Defeito (Opcional, Select) */}
            <div className="space-y-2">
              <Label htmlFor="criticidade_defeito">Criticidade do Defeito</Label>
              {/* Alterado: value 'none' para representar null */}
              <Select value={criticidadeDefeito || 'none'} onValueChange={(value) => setCriticidadeDefeito(value === 'none' ? null : value)}>
                <SelectTrigger id="criticidade_defeito">
                  <SelectValue placeholder="Selecione a Criticidade" />
                </SelectTrigger>
                <SelectContent>
                  {/* Adicionado SelectItem com value='none' */}
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ambiente (Obrigatório, Default 'DEV') */}
            <div className="space-y-2">
              <Label htmlFor="ambiente">Ambiente</Label>
              <Select value={ambiente} onValueChange={setAmbiente} required>
                <SelectTrigger id="ambiente">
                  <SelectValue placeholder="Selecione o Ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEV">DEV</SelectItem>
                  <SelectItem value="QA">QA</SelectItem>
                  <SelectItem value="STAGING">STAGING</SelectItem>
                  <SelectItem value="PRODUÇÃO">PRODUÇÃO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bug ID (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="bug_id">Bug ID</Label>
              <Input
                id="bug_id"
                value={bugId}
                onChange={(e) => setBugId(e.target.value)}
                placeholder="ID do Bug"
              />
            </div>
          </div>

          {/* Observações (Mapeado de insights_qa, Opcional, Textarea) */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações e insights da execução"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Reaberto (NOVO, Obrigatório, Checkbox) */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="reaberto"
              checked={reaberto}
              onCheckedChange={(checked) => setReaberto(Boolean(checked))}
            />
            <Label htmlFor="reaberto" className="ml-2 cursor-pointer">
              Reaberto
            </Label>
          </div>

          {/* Status de Automação (NOVO, Obrigatório, Select) */}
          <div className="space-y-2">
            <Label htmlFor="status_automacao">Status de Automação</Label>
            <Select value={statusAutomacao} onValueChange={setStatusAutomacao} required>
              <SelectTrigger id="status_automacao">
                <SelectValue placeholder="Selecione o Status da Automação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Não Automatizado">Não Automatizado</SelectItem>
                <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                <SelectItem value="Automatizado">Automatizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Flaky (Obrigatório, Checkbox) */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="flaky"
              checked={flaky}
              onCheckedChange={(checked) => setFlaky(Boolean(checked))}
            />
            <Label htmlFor="flaky" className="ml-2 cursor-pointer">
              Teste Flaky
            </Label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
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