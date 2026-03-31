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

interface CasoTeste {
  id: number
  historia_id: number
  tc_id: string
  titulo: string
  tipo_teste: string
  status_teste: string
  prioridade_teste: string
  created_at: string
}

export function CasosTestePage() {
  const [casos, setCasos] = useState<CasoTeste[]>([])
  const [historias, setHistorias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedHistoria, setSelectedHistoria] = useState('')
  const [formData, setFormData] = useState({
    tc_id: '',
    titulo: '',
    passos: '',
    requisitos: '',
    regra: '',
    resultado_esperado: '',
    tipo_teste: 'Funcional',
    prioridade_teste: 'Média',
    status_teste: 'Não Executado',
    status_automacao: 'Não Automatizado',
  })
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [casosRes, historiasRes] = await Promise.all([
        fetch('/api/casos-teste'),
        fetch('/api/historias'),
      ])
      setCasos(await casosRes.json())
      setHistorias(await historiasRes.json())
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao buscar dados',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHistoria) {
      toast({ title: 'Aviso', description: 'Selecione uma história' })
      return
    }

    try {
      const response = await fetch('/api/casos-teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, historia_id: parseInt(selectedHistoria), created_by: 1 }),
      })

      if (response.ok) {
        toast({ title: 'Sucesso', description: 'Caso de teste criado com sucesso' })
        setFormData({ tc_id: '', titulo: '', passos: '', requisitos: '', regra: '', resultado_esperado: '', tipo_teste: 'Funcional', prioridade_teste: 'Média', status_teste: 'Não Executado', status_automacao: 'Não Automatizado' })
        setIsOpen(false)
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao criar caso', variant: 'destructive' })
    }
  }

  const priorityColor = {
    Crítica: 'bg-red-100 text-red-800',
    Alta: 'bg-orange-100 text-orange-800',
    Média: 'bg-yellow-100 text-yellow-800',
    Baixa: 'bg-green-100 text-green-800',
  }

  const statusColor = {
    Aprovado: 'bg-green-100 text-green-800',
    Reprovado: 'bg-red-100 text-red-800',
    'Não Executado': 'bg-gray-100 text-gray-800',
    'Em Andamento': 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Casos de Teste</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Caso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Caso de Teste</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Historia</label>
                <Select value={selectedHistoria} onValueChange={setSelectedHistoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma história" />
                  </SelectTrigger>
                  <SelectContent>
                    {historias.map((h) => (
                      <SelectItem key={h.id} value={h.id.toString()}>
                        {h.nome_feature} - {h.titulo_historia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">TC ID</label>
                  <Input value={formData.tc_id} onChange={(e) => setFormData({ ...formData, tc_id: e.target.value })} placeholder="TC-001" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Título do caso" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Passos</label>
                <Textarea value={formData.passos} onChange={(e) => setFormData({ ...formData, passos: e.target.value })} placeholder="Passos do teste" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Teste</label>
                  <Select value={formData.tipo_teste} onValueChange={(value) => setFormData({ ...formData, tipo_teste: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Funcional">Funcional</SelectItem>
                      <SelectItem value="Regressivo">Regressivo</SelectItem>
                      <SelectItem value="E2E">E2E</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={formData.prioridade_teste} onValueChange={(value) => setFormData({ ...formData, prioridade_teste: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Criar Caso
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
              <TableHead>TC ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {casos.map((caso) => (
              <TableRow key={caso.id}>
                <TableCell className="font-medium">{caso.tc_id}</TableCell>
                <TableCell>{caso.titulo}</TableCell>
                <TableCell>{caso.tipo_teste}</TableCell>
                <TableCell>
                  <Badge className={priorityColor[caso.prioridade_teste as keyof typeof priorityColor]}>
                    {caso.prioridade_teste}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColor[caso.status_teste as keyof typeof statusColor]}>
                    {caso.status_teste}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
