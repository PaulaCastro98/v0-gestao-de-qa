'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Upload } from 'lucide-react'

interface Bug {
  id: number
  caso_teste_id: number
  tarefa_bug: string
  descricao: string
  status: string
  sprint: string
  created_at: string
}

interface Caso {
  id: number
  tc_id: string
  titulo: string
}

export function BugsPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCaso, setSelectedCaso] = useState('')
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    tarefa_bug: '',
    descricao: '',
    sprint: '',
    status: 'Aberto',
  })
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [bugsRes, casosRes] = await Promise.all([
        fetch('/api/bugs'),
        fetch('/api/casos-teste?status_teste=Reprovado'),
      ])
      setBugs(await bugsRes.json())
      setCasos(await casosRes.json())
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao buscar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCaso) {
      toast({ title: 'Aviso', description: 'Selecione um caso de teste' })
      return
    }

    try {
      const response = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, caso_teste_id: parseInt(selectedCaso), created_by: 1 }),
      })

      if (response.ok) {
        toast({ title: 'Sucesso', description: 'Bug criado com sucesso' })
        setFormData({ tarefa_bug: '', descricao: '', sprint: '', status: 'Aberto' })
        setIsOpen(false)
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao criar bug', variant: 'destructive' })
    }
  }

  const handleFileUpload = async (bugId: number, file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bug_id', bugId.toString())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast({ title: 'Sucesso', description: 'Evidência enviada com sucesso' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao enviar evidência', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const statusColor = {
    Aberto: 'bg-red-100 text-red-800',
    'Em Análise': 'bg-blue-100 text-blue-800',
    Corrigido: 'bg-green-100 text-green-800',
    Fechado: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bugs</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Bug
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Novo Bug</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Caso de Teste (Reprovado)</label>
                <Select value={selectedCaso} onValueChange={setSelectedCaso}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um caso reprovado" />
                  </SelectTrigger>
                  <SelectContent>
                    {casos.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.tc_id} - {c.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tarefa do Bug</label>
                <Input value={formData.tarefa_bug} onChange={(e) => setFormData({ ...formData, tarefa_bug: e.target.value })} placeholder="Descrição breve do bug" required />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Descrição detalhada" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sprint</label>
                  <Input value={formData.sprint} onChange={(e) => setFormData({ ...formData, sprint: e.target.value })} placeholder="Sprint" />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em Análise">Em Análise</SelectItem>
                      <SelectItem value="Corrigido">Corrigido</SelectItem>
                      <SelectItem value="Fechado">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Criar Bug
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bugs.map((bug) => (
              <TableRow key={bug.id}>
                <TableCell className="font-medium">{bug.tarefa_bug}</TableCell>
                <TableCell>{bug.descricao?.substring(0, 50)}...</TableCell>
                <TableCell>
                  <Badge className={statusColor[bug.status as keyof typeof statusColor]}>
                    {bug.status}
                  </Badge>
                </TableCell>
                <TableCell>{bug.sprint}</TableCell>
                <TableCell>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(bug.id, file)
                      }}
                      disabled={uploading}
                      className="hidden"
                    />
                    <Button size="sm" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Evidência
                      </span>
                    </Button>
                  </label>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
