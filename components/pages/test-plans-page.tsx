'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Pencil, Trash2, ClipboardList, ChevronDown, ChevronRight,
  Search, X, CheckSquare, Square, FolderOpen, ArrowLeft
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Plan = { id: number; title: string; description: string | null; created_at: string }
type PlanCase = {
  id: number; title: string; priority: string; status: string; type: string
  automation_status: string; suite_id: number | null; suite_name: string | null
  plan_case_id: number
}
type AvailableCase = {
  id: number; title: string; priority: string; status: string; type: string
  suite_id: number | null; suite_name: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
  'Crítica': 'bg-red-100 text-red-700',
  'Alta': 'bg-orange-100 text-orange-700',
  'Média': 'bg-yellow-100 text-yellow-700',
  'Baixa': 'bg-green-100 text-green-700',
}
const STATUS_COLOR: Record<string, string> = {
  'Aprovado': 'bg-green-100 text-green-700',
  'Reprovado': 'bg-red-100 text-red-700',
  'Em Andamento': 'bg-blue-100 text-blue-700',
  'Bloqueado': 'bg-gray-200 text-gray-600',
}

// ─── Plan Detail View ─────────────────────────────────────────────────────────
function PlanDetail({
  plan,
  onBack,
  onEdit,
}: {
  plan: Plan
  onBack: () => void
  onEdit: (p: Plan) => void
}) {
  const [cases, setCases] = useState<PlanCase[]>([])
  const [loadingCases, setLoadingCases] = useState(true)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [availableCases, setAvailableCases] = useState<AvailableCase[]>([])
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => { fetchCases() }, [plan.id])

  const fetchCases = async () => {
    try {
      setLoadingCases(true)
      const res = await fetch(`/api/test-plan-cases?planId=${plan.id}`)
      if (res.ok) setCases(await res.json())
    } finally {
      setLoadingCases(false)
    }
  }

  const openAddPanel = async () => {
    setSearch('')
    setSelectedIds(new Set())
    const res = await fetch('/api/test-cases')
    if (res.ok) {
      const all: AvailableCase[] = await res.json()
      const linkedIds = new Set(cases.map(c => c.id))
      const available = all.filter(c => !linkedIds.has(c.id))
      setAvailableCases(available)
      // auto-expand all suites
      const suites = new Set(available.map(c => c.suite_name ?? 'Sem Suite'))
      setExpandedSuites(suites)
    }
    setShowAddPanel(true)
  }

  const filteredAvailable = useMemo(() => {
    if (!search.trim()) return availableCases
    const q = search.toLowerCase()
    return availableCases.filter(c => c.title.toLowerCase().includes(q))
  }, [availableCases, search])

  const groupedAvailable = useMemo(() => {
    const map = new Map<string, AvailableCase[]>()
    for (const c of filteredAvailable) {
      const key = c.suite_name ?? 'Sem Suite'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return map
  }, [filteredAvailable])

  const toggleSuite = (name: string) =>
    setExpandedSuites(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  const toggleCase = (id: number) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleSuiteAll = (name: string, casesInSuite: AvailableCase[]) => {
    const ids = casesInSuite.map(c => c.id)
    const allSelected = ids.every(id => selectedIds.has(id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      allSelected ? ids.forEach(id => next.delete(id)) : ids.forEach(id => next.add(id))
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAvailable.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredAvailable.map(c => c.id)))
    }
  }

  const handleAddSelected = async () => {
    if (selectedIds.size === 0) return
    const res = await fetch('/api/test-plan-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan.id, caseIds: Array.from(selectedIds) }),
    })
    if (res.ok) {
      setShowAddPanel(false)
      fetchCases()
      toast({ title: 'Sucesso', description: `${selectedIds.size} caso(s) adicionado(s)` })
    } else {
      toast({ title: 'Erro', description: 'Falha ao adicionar casos' })
    }
  }

  const handleRemoveCase = async (planCaseId: number) => {
    const res = await fetch(`/api/test-plan-cases?planCaseId=${planCaseId}`, { method: 'DELETE' })
    if (res.ok) {
      fetchCases()
      toast({ title: 'Sucesso', description: 'Caso removido do plano' })
    }
  }

  // Group linked cases by suite
  const groupedCases = useMemo(() => {
    const map = new Map<string, PlanCase[]>()
    for (const c of cases) {
      const key = c.suite_name ?? 'Sem Suite'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return map
  }, [cases])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
        <button
          onClick={() => onEdit(plan)}
          className="ml-1 text-gray-400 hover:text-gray-600 transition"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      {plan.description && (
        <p className="text-gray-500 text-sm mb-6 ml-8">{plan.description}</p>
      )}

      {/* Cases header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Casos de Teste</span>
          <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
            {cases.length}
          </span>
        </div>
        <Button size="sm" onClick={openAddPanel}>
          <Plus className="w-4 h-4 mr-1" />
          Add cases
        </Button>
      </div>

      {/* Cases list grouped by suite */}
      {loadingCases ? (
        <p className="text-gray-400 text-sm py-8 text-center">Carregando...</p>
      ) : cases.length === 0 ? (
        <div className="border border-dashed rounded-lg py-12 text-center text-gray-400">
          <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum caso adicionado a este plano</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={openAddPanel}>
            + Add cases
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden divide-y divide-gray-100">
          {Array.from(groupedCases.entries()).map(([suiteName, suiteCases]) => (
            <div key={suiteName}>
              {/* Suite header row */}
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2">
                // ✅ Depois
                <button onClick={() => toggleSuiteAll(suiteName, suiteCases)} className="shrink-0" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{suiteName}</span>
                <span className="text-xs text-gray-400">({suiteCases.length})</span>
              </div>
              {/* Cases in suite */}
              {suiteCases.map((c) => (
                <div key={c.plan_case_id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 truncate">{c.title}</span>
                  </div>
                  <Badge className={`text-xs ${PRIORITY_COLOR[c.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                    {c.priority || 'Média'}
                  </Badge>
                  <Badge className={`text-xs ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {c.status || 'Pendente'}
                  </Badge>
                  <span className="text-xs text-gray-400 w-20 text-right">{c.automation_status || 'Manual'}</span>
                  <button
                    onClick={() => handleRemoveCase(c.plan_case_id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Add Cases Panel (Dialog) */}
      <Dialog open={showAddPanel} onOpenChange={setShowAddPanel}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 className="font-semibold text-base">Selecionar casos de teste</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedIds.size} {selectedIds.size === 1 ? 'caso selecionado' : 'casos selecionados'}
              </p>
            </div>
          </div>

          {/* Search + filter row */}
          <div className="flex items-center gap-2 px-5 py-3 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar casos..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Select all row */}
          <div className="flex items-center justify-between px-5 py-2 border-b bg-gray-50">
            <button
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              onClick={toggleSelectAll}
            >
              {selectedIds.size === filteredAvailable.length && filteredAvailable.length > 0
                ? <CheckSquare className="w-4 h-4 text-blue-500" />
                : <Square className="w-4 h-4" />
              }
              Selecionar todos
            </button>
            <span className="text-xs text-gray-400">
              {selectedIds.size}/{filteredAvailable.length}
            </span>
          </div>

          {/* Cases grouped by suite */}
          <div className="flex-1 overflow-y-auto">
            {filteredAvailable.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">
                {availableCases.length === 0 ? 'Todos os casos já estão no plano' : 'Nenhum resultado encontrado'}
              </p>
            ) : (
              Array.from(groupedAvailable.entries()).map(([suiteName, suiteCases]) => {
                const isExpanded = expandedSuites.has(suiteName)
                const allChecked = suiteCases.every(c => selectedIds.has(c.id))
                return (
                  <div key={suiteName}>
                    {/* Suite row */}
                    <div className="flex items-center gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
                     // ✅ Depois
                      <button onClick={() => toggleSuiteAll(suiteName, suiteCases)} className="shrink-0">
                        {allChecked
                          ? <CheckSquare className="w-4 h-4 text-blue-500" />
                          : <Square className="w-4 h-4 text-gray-300" />
                        }
                      </button>
                      <button
                        className="flex items-center gap-1.5 flex-1 text-left"
                        onClick={() => toggleSuite(suiteName)}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        }
                        <FolderOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-gray-600">{suiteName}</span>
                        <span className="text-xs text-gray-400">({suiteCases.length})</span>
                      </button>
                    </div>
                    {/* Cases */}
                    {isExpanded && suiteCases.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleCase(c.id)}
                        />
                       // ✅ Depois
                        ? <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" />
                        : <Square className="w-4 h-4 text-gray-300 shrink-0" />
                        <span className="flex-1 text-sm text-gray-700">{c.title}</span>
                        <Badge className={`text-xs ${PRIORITY_COLOR[c.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.priority || 'Média'}
                        </Badge>
                      </label>
                    ))}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t bg-white">
            <Button variant="outline" onClick={() => setShowAddPanel(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSelected} disabled={selectedIds.size === 0}>
              Adicionar {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TestPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [activePlan, setActivePlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '' })
  const { toast } = useToast()

  useEffect(() => { fetchPlans() }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/test-plans')
      if (res.ok) setPlans(await res.json())
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar planos' })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingPlan(null)
    setFormData({ title: '', description: '' })
    setShowModal(true)
  }

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({ title: plan.title, description: plan.description || '' })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório' })
      return
    }
    try {
      const url = '/api/test-plans'
      const method = editingPlan ? 'PUT' : 'POST'
      const body = editingPlan ? { id: editingPlan.id, ...formData } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const updated = await res.json()
        setShowModal(false)
        fetchPlans()
        // if editing the currently open plan, update it
        if (editingPlan && activePlan?.id === editingPlan.id) {
          setActivePlan(updated)
        }
        toast({ title: 'Sucesso', description: editingPlan ? 'Plano atualizado' : 'Plano criado' })
      } else {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha na operação' })
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha na operação' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return
    try {
      const res = await fetch(`/api/test-plans?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchPlans()
        if (activePlan?.id === id) setActivePlan(null)
        toast({ title: 'Sucesso', description: 'Plano excluído' })
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir' })
    }
  }

  // Show plan detail view
  if (activePlan) {
    return (
      <>
        <PlanDetail
          plan={activePlan}
          onBack={() => setActivePlan(null)}
          onEdit={(p) => { openEdit(p); }}
        />
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Plano</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">Salvar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Plans list view
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Plans</h1>
          <p className="text-gray-600 mt-2">Organize planos de teste</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Carregando...</p>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Nenhum test plan criado ainda</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setActivePlan(plan)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  // ✅ Depois
                  <div className="p-2 bg-green-100 rounded shrink-0">
                    <ClipboardList className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{plan.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{plan.description || 'Sem descrição'}</p>
                  </div>
                </div>
                // ✅ Depois
                <div className="flex gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input
                placeholder="Ex: Regressão Sprint 12"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Ex: Plano de regressão completo da sprint 12"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
