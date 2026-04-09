'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Bug, X } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const SEVERITIES = ['Baixa', 'Média', 'Alta', 'Crítica']
const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Urgente']
const STATUSES = ['Aberto', 'Em Análise', 'Em Correção', 'Resolvido', 'Fechado', 'Reaberto']

const emptyForm = {
  title: '',
  feature_story: '',
  linked_card_id: '',
  suite_id: '',
  severity: 'Média',
  priority: 'Média',
  status: 'Aberto',
  sprint_release: '',
  description: '',
  description_markdown: '',
  steps: [''] as string[],
  expected_result: '',
  actual_result: '',
  comments: '',
  adjustment: '',
}

export default function BugsPage() {
  const [bugs, setBugs] = useState<any[]>([])
  const [suites, setSuites] = useState<any[]>([])
  const [kanbanCards, setKanbanCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBug, setEditingBug] = useState<any>(null)
  const [formData, setFormData] = useState({ ...emptyForm })
  const [cardSearch, setCardSearch] = useState('')
  const [showCardDropdown, setShowCardDropdown] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBugs()
    fetchSuites()
  }, [])

  useEffect(() => {
    if (showModal) {
      fetchKanbanCards()
    }
  }, [showModal])

  const fetchBugs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bugs')
      if (res.ok) setBugs(await res.json())
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar bugs' })
    } finally {
      setLoading(false)
    }
  }

  const fetchSuites = async () => {
    try {
      const res = await fetch('/api/test-suites')
      if (res.ok) setSuites(await res.json())
    } catch {}
  }

  const fetchKanbanCards = async () => {
    try {
      const res = await fetch('/api/kanban/cards/all')
      if (res.ok) {
        const cards = await res.json()
        setKanbanCards(cards)
      }
    } catch (error) {
      console.error('[v0] Error fetching kanban cards:', error)
    }
  }

  const openCreate = () => {
    setEditingBug(null)
    setFormData({ ...emptyForm })
    setCardSearch('')
    setShowModal(true)
  }

  const openEdit = (bug: any) => {
    setEditingBug(bug)
    setFormData({
      title: bug.title || '',
      feature_story: bug.feature_story || '',
      linked_card_id: bug.linked_card_id?.toString() || '',
      suite_id: bug.suite_id?.toString() || '',
      severity: bug.severity || 'Média',
      priority: bug.priority || 'Média',
      status: bug.status || 'Aberto',
      sprint_release: bug.sprint_release || '',
      description: bug.description || '',
      description_markdown: bug.description_markdown || '',
      steps: bug.steps?.length ? bug.steps : [''],
      expected_result: bug.expected_result || '',
      actual_result: bug.actual_result || '',
      comments: bug.comments || '',
      adjustment: bug.adjustment || '',
    })
    setCardSearch('')
    setShowModal(true)
  }

  const setField = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const addStep = () =>
    setFormData((prev) => ({ ...prev, steps: [...prev.steps, ''] }))

  const updateStep = (index: number, value: string) =>
    setFormData((prev) => {
      const steps = [...prev.steps]
      steps[index] = value
      return { ...prev, steps }
    })

  const removeStep = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }))

  const handleSelectCard = (card: any) => {
    setFormData((prev) => ({
      ...prev,
      feature_story: card.title,
      linked_card_id: card.id.toString(),
    }))
    setCardSearch('')
    setShowCardDropdown(false)
  }

  const filteredCards = useMemo(() => {
    if (!cardSearch.trim()) return []
    return kanbanCards.filter((card) =>
      card.title.toLowerCase().includes(cardSearch.toLowerCase()) ||
      (card.column?.name || '').toLowerCase().includes(cardSearch.toLowerCase())
    )
  }, [cardSearch, kanbanCards])

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório' })
      return
    }
    if (!formData.severity) {
      toast({ title: 'Erro', description: 'Severidade é obrigatória' })
      return
    }

    try {
      const url = '/api/bugs'
      const method = editingBug ? 'PUT' : 'POST'
      const body = {
        ...(editingBug && { id: editingBug.id }),
        title: formData.title,
        feature_story: formData.feature_story || null,
        linked_card_id: formData.linked_card_id ? parseInt(formData.linked_card_id) : null,
        suite_id: formData.suite_id ? parseInt(formData.suite_id) : null,
        severity: formData.severity,
        priority: formData.priority,
        status: formData.status,
        sprint_release: formData.sprint_release || null,
        description: formData.description || null,
        description_markdown: formData.description_markdown || null,
        steps: formData.steps.filter(s => s.trim()),
        expected_result: formData.expected_result || null,
        actual_result: formData.actual_result || null,
        comments: formData.comments || null,
        adjustment: formData.adjustment || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        fetchBugs()
        toast({ title: 'Sucesso', description: editingBug ? 'Bug atualizado' : 'Bug registrado' })
      } else {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha na operação' })
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha na operação' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este bug?')) return
    try {
      const res = await fetch(`/api/bugs?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchBugs()
        toast({ title: 'Sucesso', description: 'Bug excluído' })
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir' })
    }
  }

  const getSeverityColor = (s: string) => {
    const v = s?.toLowerCase()
    if (v === 'crítica' || v === 'critica') return 'bg-red-100 text-red-800'
    if (v === 'alta') return 'bg-orange-100 text-orange-800'
    if (v === 'média' || v === 'media') return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusColor = (s: string) => {
    const v = s?.toLowerCase()
    if (v === 'resolvido' || v === 'fechado') return 'bg-green-100 text-green-800'
    if (v === 'em correção' || v === 'em correcao') return 'bg-blue-100 text-blue-800'
    if (v === 'reaberto') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bugs</h1>
          <p className="text-gray-600 mt-2">Reporte e gerencie bugs encontrados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Bug
        </Button>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Carregando...</p>
        </Card>
      ) : bugs.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Nenhum bug reportado ainda</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bugs.map((bug) => (
            <Card key={bug.id} className="p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-red-100 rounded">
                    <Bug className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{bug.title || 'Sem título'}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {bug.feature_story ? `Feature: ${bug.feature_story}` : bug.description || 'Sem descrição'}
                    </p>
                  </div>
                  <Badge className={getSeverityColor(bug.severity)}>{bug.severity || 'Média'}</Badge>
                  <Badge className={getStatusColor(bug.status)}>{bug.status || 'Aberto'}</Badge>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(bug)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(bug.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingBug ? 'Editar Bug' : 'Registrar Novo Bug'}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto space-y-5 pr-2" style={{ maxHeight: 'calc(85vh - 140px)' }}>

            {/* Título */}
            <div className="space-y-1.5">
              <Label>Título <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Descreva o bug de forma objetiva"
                value={formData.title}
                onChange={(e) => setField('title', e.target.value)}
              />
            </div>

            {/* Feature com Autocomplete */}
            <div className="space-y-1.5 relative">
              <Label>Feature / História (Cards do Kanban)</Label>
              <div className="relative">
                <Input
                  placeholder="Busque um card do kanban ou digite livremente"
                  value={cardSearch || formData.feature_story}
                  onChange={(e) => {
                    setCardSearch(e.target.value)
                    setShowCardDropdown(true)
                  }}
                  onFocus={() => setShowCardDropdown(true)}
                />
                {formData.linked_card_id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        feature_story: '',
                        linked_card_id: '',
                      }))
                      setCardSearch('')
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {showCardDropdown && filteredCards.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {filteredCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleSelectCard(card)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-0"
                    >
                      <div className="font-medium text-sm">{card.title}</div>
                      <div className="text-xs text-gray-500">{card.column?.name || 'Sem coluna'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Test Suite */}
            <div className="space-y-1.5">
              <Label>Test Suite</Label>
              <Select value={formData.suite_id} onValueChange={(v) => setField('suite_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma suite (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {suites.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Severidade, Prioridade, Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Severidade <span className="text-red-500">*</span></Label>
                <Select value={formData.severity} onValueChange={(v) => setField('severity', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select value={formData.priority} onValueChange={(v) => setField('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sprint / Release */}
            <div className="space-y-1.5">
              <Label>Sprint / Release</Label>
              <Input
                placeholder="Ex: Sprint 10, v2.3.1"
                value={formData.sprint_release}
                onChange={(e) => setField('sprint_release', e.target.value)}
              />
            </div>

            <Separator />

            {/* Editor Markdown */}
            <div className="space-y-1.5">
              <Label>Descrição do Bug</Label>
              <div data-color-mode="light" className="rounded-lg overflow-hidden">
                <MDEditor
                  value={formData.description_markdown}
                  onChange={(val) => {
                    setField('description_markdown', val || '')
                    setField('description', val || '')
                  }}
                  preview="edit"
                  height={180}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Digite a descrição do bug em Markdown (suporta formatação rica)...',
                  }}
                  previewOptions={{
                    className: 'p-4'
                  }}
                />
              </div>
            </div>

            {/* Passos para reproduzir */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Passos para Reproduzir</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar passo
                </Button>
              </div>
              <div className="space-y-2">
                {formData.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <Input
                      placeholder={`Passo ${idx + 1}`}
                      value={step}
                      onChange={(e) => updateStep(idx, e.target.value)}
                      className="flex-1"
                    />
                    {formData.steps.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 text-gray-400 hover:text-red-500"
                        onClick={() => removeStep(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Resultado Esperado / Obtido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Resultado Esperado</Label>
                <Textarea
                  placeholder="O que deveria acontecer..."
                  value={formData.expected_result}
                  onChange={(e) => setField('expected_result', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Resultado Obtido</Label>
                <Textarea
                  placeholder="O que aconteceu de fato..."
                  value={formData.actual_result}
                  onChange={(e) => setField('actual_result', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Ajuste sugerido */}
            <div className="space-y-1.5">
              <Label>Ajuste Sugerido</Label>
              <Textarea
                placeholder="Sugestão de correção ou comportamento esperado..."
                value={formData.adjustment}
                onChange={(e) => setField('adjustment', e.target.value)}
                rows={2}
              />
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label>Observações / Comentários</Label>
              <Textarea
                placeholder="Informações adicionais, links, evidências..."
                value={formData.comments}
                onChange={(e) => setField('comments', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t mt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {editingBug ? 'Salvar Alterações' : 'Registrar Bug'}
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
