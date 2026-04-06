'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react'

export default function TestSuitesPage() {
  const [suites, setSuites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSuite, setEditingSuite] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '', preCondition: '' })
  const { toast } = useToast()

  useEffect(() => {
    fetchSuites()
  }, [])

  const fetchSuites = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/test-suites')
      if (res.ok) {
        const data = await res.json()
        setSuites(data)
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar suites' })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingSuite(null)
    setFormData({ name: '', description: '', preCondition: '' })
    setShowModal(true)
  }

  const openEdit = (suite: any) => {
    setEditingSuite(suite)
    setFormData({ name: suite.name, description: suite.description || '', preCondition: suite.pre_condition || '' })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório' })
      return
    }

    try {
      const url = '/api/test-suites'
      const method = editingSuite ? 'PUT' : 'POST'
      const body = editingSuite
        ? { id: editingSuite.id, ...formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        fetchSuites()
        toast({ title: 'Sucesso', description: editingSuite ? 'Suite atualizada' : 'Suite criada' })
      } else {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha na operação' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha na operação' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta suite?')) return

    try {
      const res = await fetch(`/api/test-suites?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchSuites()
        toast({ title: 'Sucesso', description: 'Suite excluída' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir' })
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Suites</h1>
          <p className="text-gray-600 mt-2">Organize seus testes em suites</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Suite
        </Button>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Carregando...</p>
        </Card>
      ) : suites.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-12">Nenhuma test suite criada ainda</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suites.map((suite) => (
            <Card key={suite.id} className="p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{suite.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{suite.description || 'Sem descrição'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(suite)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(suite.id)}>
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
            <DialogTitle>{editingSuite ? 'Editar Suite' : 'Nova Suite'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome da suite"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição da suite"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Pré-condições</Label>
              <Textarea
                placeholder="Pré-condições para execução"
                value={formData.preCondition}
                onChange={(e) => setFormData({ ...formData, preCondition: e.target.value })}
                rows={2}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingSuite ? 'Salvar Alterações' : 'Criar Suite'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
