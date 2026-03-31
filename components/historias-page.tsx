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
import { Plus } from 'lucide-react'

interface Historia {
  id: number
  nome_feature: string
  titulo_historia: string
  descricao_historia: string
  link_historia: string
  status: string
  sprint: string
  created_at: string
}

export function HistoriasPage() {
  const [historias, setHistorias] = useState<Historia[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome_feature: '',
    titulo_historia: '',
    descricao_historia: '',
    link_historia: '',
    status: 'To Do',
    sprint: '',
  })
  const { toast } = useToast()

  const fetchHistorias = async () => {
    try {
      const response = await fetch('/api/historias')
      const data = await response.json()
      setHistorias(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao buscar histórias',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistorias()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/historias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, created_by: 1 }),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'História criada com sucesso',
        })
        setFormData({ nome_feature: '', titulo_historia: '', descricao_historia: '', link_historia: '', status: 'To Do', sprint: '' })
        setIsOpen(false)
        fetchHistorias()
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar história',
        variant: 'destructive',
      })
    }
  }

  const statusColor = {
    'To Do': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Done': 'bg-green-100 text-green-800',
    'Blocked': 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Histórias</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova História
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova História</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Feature</label>
                <Input
                  value={formData.nome_feature}
                  onChange={(e) => setFormData({ ...formData, nome_feature: e.target.value })}
                  placeholder="Nome da feature"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Título da História</label>
                <Input
                  value={formData.titulo_historia}
                  onChange={(e) => setFormData({ ...formData, titulo_historia: e.target.value })}
                  placeholder="Título"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.descricao_historia}
                  onChange={(e) => setFormData({ ...formData, descricao_historia: e.target.value })}
                  placeholder="Descrição da história"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link da História</label>
                <Input
                  value={formData.link_historia}
                  onChange={(e) => setFormData({ ...formData, link_historia: e.target.value })}
                  placeholder="Link (URL)"
                  type="url"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="To Do">To Do</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sprint</label>
                  <Input
                    value={formData.sprint}
                    onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
                    placeholder="Sprint"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Criar História
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
              <TableHead>Feature</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sprint</TableHead>
              <TableHead>Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historias.map((historia) => (
              <TableRow key={historia.id}>
                <TableCell className="font-medium">{historia.nome_feature}</TableCell>
                <TableCell>{historia.titulo_historia}</TableCell>
                <TableCell>
                  <Badge className={statusColor[historia.status as keyof typeof statusColor]}>
                    {historia.status}
                  </Badge>
                </TableCell>
                <TableCell>{historia.sprint}</TableCell>
                <TableCell>
                  {historia.link_historia && (
                    <a href={historia.link_historia} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Ver
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
