'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Play } from 'lucide-react'

const STATUSES = ['Pendente', 'Em Execução', 'Concluído', 'Cancelado']

export default function TestRunsPage() {
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRun, setEditingRun] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', status: 'Pendente' })
  const { toast } = useToast()

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/test-runs')
      if (res.ok) {
        const data = await res.json()
        setRuns(data)
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar execuções' })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingRun(null)
    setFormData({ name: '', status: 'Pendente' })
    setShowModal(true)
  }

  const openEdit = (run: any) => {
    setEditingRun(run)
    setFormData({ name: run.name, status: run.status || 'Pendente' })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório' })
      return
    }

    try {
      const url = '/api/test-runs'
      const method = editingRun ? 'PUT' : 'POST'
      const body = editingRun ? { id: editingRun.id, ...formData } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        fetchRuns()
        toast({ title: 'Sucesso', description: editingRun ? 'Execução atualizada' : 'Execução criada' })
      } else {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha na operação' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha na operação' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta execução?')) return

    try {
      const res = await fetch(`/api/test-runs?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRuns()
        toast({ title: 'Sucesso', description: 'Execução excluída' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'concluído': case 'concluido': return 'bg-green-100 text-green-800'
      case 'em execução': case 'em execucao': return 'bg-blue-100 text-blue-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Runs</h1>
          <p className="text-gray-600 mt-2">Execute e monitore execuções de teste</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Execução
        </Button>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Carregando...</p>
        </Card>
      ) : runs.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Nenhuma execução de teste criada ainda</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <Card key={run.id} className="p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-orange-100 rounded">
                    <Play className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{run.name}</h3>
                    <p className="text-sm text-gray-500">
                      Iniciado: {run.started_at ? new Date(run.started_at).toLocaleString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(run.status)}>
                    {run.status || 'Pendente'}
                  </Badge>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(run)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(run.id)}>
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
            <DialogTitle>{editingRun ? 'Editar Execução' : 'Nova Execução'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome da execução"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingRun ? 'Salvar Alterações' : 'Criar Execução'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
