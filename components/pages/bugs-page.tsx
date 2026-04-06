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
import { Plus, Pencil, Trash2, Bug } from 'lucide-react'

const SEVERITIES = ['Baixa', 'Média', 'Alta', 'Crítica']
const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Urgente']
const STATUSES = ['Aberto', 'Em Análise', 'Em Correção', 'Resolvido', 'Fechado', 'Reaberto']

export default function BugsPage() {
  const [bugs, setBugs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBug, setEditingBug] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '', description: '', severity: 'Média', priority: 'Média', status: 'Aberto', sprintRelease: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchBugs()
  }, [])

  const fetchBugs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/bugs')
      if (res.ok) {
        const data = await res.json()
        setBugs(data)
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar bugs' })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingBug(null)
    setFormData({ title: '', description: '', severity: 'Média', priority: 'Média', status: 'Aberto', sprintRelease: '' })
    setShowModal(true)
  }

  const openEdit = (bug: any) => {
    setEditingBug(bug)
    setFormData({
      title: bug.title || '',
      description: bug.description || '',
      severity: bug.severity || 'Média',
      priority: bug.priority || 'Média',
      status: bug.status || 'Aberto',
      sprintRelease: bug.sprint_release || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório' })
      return
    }

    try {
      const url = '/api/bugs'
      const method = editingBug ? 'PUT' : 'POST'
      const body = {
        ...(editingBug && { id: editingBug.id }),
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        priority: formData.priority,
        status: formData.status,
        sprint_release: formData.sprintRelease
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        fetchBugs()
        toast({ title: 'Sucesso', description: editingBug ? 'Bug atualizado' : 'Bug criado' })
      } else {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha na operação' })
      }
    } catch (error) {
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
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir' })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'crítica': case 'critica': return 'bg-red-100 text-red-800'
      case 'alta': return 'bg-orange-100 text-orange-800'
      case 'média': case 'media': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolvido': case 'fechado': return 'bg-green-100 text-green-800'
      case 'em correção': case 'em correcao': return 'bg-blue-100 text-blue-800'
      case 'reaberto': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
                    <h3 className="font-semibold">{bug.title || bug.tarefa_bug || 'Sem título'}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{bug.description || bug.descricao || 'Sem descrição'}</p>
                  </div>
                  <Badge className={getSeverityColor(bug.severity)}>
                    {bug.severity || 'Média'}
                  </Badge>
                  <Badge className={getStatusColor(bug.status)}>
                    {bug.status || 'Aberto'}
                  </Badge>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBug ? 'Editar Bug' : 'Novo Bug'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Título do bug"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição detalhada do bug"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Severidade</Label>
                <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sprint/Release</Label>
                <Input
                  placeholder="Ex: Sprint 10"
                  value={formData.sprintRelease}
                  onChange={(e) => setFormData({ ...formData, sprintRelease: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingBug ? 'Salvar Alterações' : 'Criar Bug'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
