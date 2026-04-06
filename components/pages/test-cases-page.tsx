'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'

const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Crítica']
const STATUSES = ['Pendente', 'Em Andamento', 'Aprovado', 'Reprovado', 'Bloqueado']
const TYPES = ['Funcional', 'Integração', 'Regressão', 'Smoke', 'Performance', 'Segurança']

const emptyForm = {
  title: '',
  description: '',
  priority: 'Média',
  status: 'Pendente',
  type: 'Funcional',
  preCondition: '',
  postCondition: '',
  steps: [''] as string[],
  expectedResult: '',
}

export default function TestCasesPage() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCase, setEditingCase] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({ ...emptyForm })
  const { toast } = useToast()

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/test-cases')
      if (res.ok) {
        const data = await res.json()
        setCases(data)
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar casos de teste' })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingCase(null)
    setFormData({ ...emptyForm, steps: [''] })
    setActiveTab('basic')
    setShowModal(true)
  }

  const openEdit = (tc: any) => {
    setEditingCase(tc)
    setFormData({
      title: tc.title || tc.titulo_tc || '',
      description: tc.description || tc.descricao_objetivo || '',
      priority: tc.priority || tc.prioridade_teste || 'Média',
      status: tc.status || tc.status_teste || 'Pendente',
      type: tc.type || tc.tipo_teste || 'Funcional',
      preCondition: tc.pre_condition || tc.pre_condicoes || '',
      postCondition: tc.post_condition || '',
      steps: tc.steps?.length ? tc.steps : [''],
      expectedResult: tc.expected_result || '',
    })
    setActiveTab('basic')
    setShowModal(true)
  }

  const setField = (key: string, value: any) =>
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

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório' })
      return
    }

    try {
      const url = editingCase ? `/api/test-cases/${editingCase.id}` : '/api/test-cases'
      const method = editingCase ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          type: formData.type,
          pre_condition: formData.preCondition,
          post_condition: formData.postCondition,
          steps: formData.steps.filter(s => s.trim()),
          expected_result: formData.expectedResult,
        }),
      })

      if (res.ok) {
        setShowModal(false)
        fetchCases()
        toast({ title: 'Sucesso', description: editingCase ? 'Caso atualizado' : 'Caso criado' })
      } else {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha na operação' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha na operação' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este caso de teste?')) return

    try {
      const res = await fetch(`/api/test-cases/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCases()
        toast({ title: 'Sucesso', description: 'Caso excluído' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir' })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'crítica':
      case 'critica':
        return 'bg-red-100 text-red-800'
      case 'alta':
        return 'bg-orange-100 text-orange-800'
      case 'média':
      case 'media':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aprovado':
        return 'bg-green-100 text-green-800'
      case 'reprovado':
        return 'bg-red-100 text-red-800'
      case 'em andamento':
        return 'bg-blue-100 text-blue-800'
      case 'bloqueado':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'steps', label: 'Steps' },
    { id: 'results', label: 'Results' },
  ]

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
          <p className="text-gray-600 mt-2">Crie e gerencie casos de teste</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Caso de Teste
        </Button>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Carregando...</p>
        </Card>
      ) : cases.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Nenhum test case criado ainda</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((tc) => (
            <Card key={tc.id} className="p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-purple-100 rounded">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{tc.title || tc.titulo_tc || 'Sem título'}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {tc.description || tc.descricao_objetivo || 'Sem descrição'}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(tc.priority || tc.prioridade_teste)}>
                    {tc.priority || tc.prioridade_teste || 'Média'}
                  </Badge>
                  <Badge className={getStatusColor(tc.status || tc.status_teste)}>
                    {tc.status || tc.status_teste || 'Pendente'}
                  </Badge>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tc)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tc.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingCase ? 'Editar Caso de Teste' : 'Novo Caso de Teste'}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs Navigation */}
          <div className="flex gap-0 border-b mb-4 -mx-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {/* Basic Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="For example: Authorization"
                    value={formData.title}
                    onChange={(e) => setField('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Detailed description of the test case"
                    value={formData.description}
                    onChange={(e) => setField('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={(v) => setField('priority', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setField('status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setField('type', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Conditions Tab */}
            {activeTab === 'conditions' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pre-Conditions</Label>
                  <Textarea
                    placeholder="Conditions that must be met before executing this test case"
                    value={formData.preCondition}
                    onChange={(e) => setField('preCondition', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Post-Conditions</Label>
                  <Textarea
                    placeholder="Conditions to verify after test execution"
                    value={formData.postCondition}
                    onChange={(e) => setField('postCondition', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Steps Tab */}
            {activeTab === 'steps' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Test Steps</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <Input
                        placeholder={`Step ${idx + 1}`}
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
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Expected Result</Label>
                  <Textarea
                    placeholder="What should happen when test steps are executed"
                    value={formData.expectedResult}
                    onChange={(e) => setField('expectedResult', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCase ? 'Save Changes' : 'Create Test Case'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
