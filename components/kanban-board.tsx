'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

const CARD_TYPES = ['Sprint', 'Épico', 'História', 'Feature', 'Bug', 'Tarefa']
const CARD_PRIORITIES = ['Baixa', 'Média', 'Alta', 'Crítica']

export function KanbanBoard({ projectId }: { projectId: string }) {
  const [columns, setColumns] = useState<any[]>([])
  const [cards, setCards] = useState<{ [key: string]: any[] }>({})
  const [search, setSearch] = useState('')
  const [draggedCard, setDraggedCard] = useState<any>(null)
  const [showNewColumn, setShowNewColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [showAddCard, setShowAddCard] = useState(false)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const [newCard, setNewCard] = useState({ title: '', description: '', type: 'Tarefa', priority: 'Média' })
  const { toast } = useToast()

  useEffect(() => {
    fetchColumns()
  }, [projectId])

  const fetchColumns = async () => {
    try {
      const res = await fetch(`/api/kanban/columns?projectId=${projectId}`)
      const cols = await res.json()
      setColumns(cols)
      cols.forEach((col: any) => fetchCards(col.id))
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar colunas' })
    }
  }

  const fetchCards = async (columnId: string) => {
    try {
      const res = await fetch(`/api/kanban/cards?columnId=${columnId}`)
      const cardsData = await res.json()
      setCards((prev) => ({ ...prev, [columnId]: cardsData }))
    } catch (error) {
      console.error('Erro ao buscar cards:', error)
    }
  }

  const addColumn = async () => {
    if (!newColumnName.trim()) return
    try {
      const res = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: newColumnName,
          position: columns.length,
        }),
      })
      if (res.ok) {
        setNewColumnName('')
        setShowNewColumn(false)
        fetchColumns()
        toast({ title: 'Sucesso', description: 'Coluna criada' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao criar coluna' })
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {
      await fetch(`/api/kanban/columns?columnId=${columnId}`, { method: 'DELETE' })
      fetchColumns()
      toast({ title: 'Sucesso', description: 'Coluna deletada' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao deletar coluna' })
    }
  }

  const openAddCard = (columnId: string) => {
    setActiveColumnId(columnId)
    setNewCard({ title: '', description: '', type: 'Tarefa', priority: 'Média' })
    setShowAddCard(true)
  }

  const addCard = async () => {
    if (!newCard.title.trim() || !activeColumnId) return
    try {
      const res = await fetch('/api/kanban/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: activeColumnId,
          title: newCard.title,
          description: newCard.description,
          type: newCard.type,
          priority: newCard.priority,
          position: cards[activeColumnId]?.length || 0,
        }),
      })
      if (res.ok) {
        setShowAddCard(false)
        fetchCards(activeColumnId)
        toast({ title: 'Sucesso', description: 'Card criado' })
      } else {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha ao criar card' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao criar card' })
    }
  }

  const handleDragStart = (card: any) => {
    setDraggedCard(card)
  }

  const handleDrop = async (columnId: string) => {
    if (!draggedCard) return
    try {
      await fetch('/api/kanban/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: draggedCard.id,
          columnId,
          position: (cards[columnId]?.length || 0),
        }),
      })
      setDraggedCard(null)
      fetchCards(draggedCard.column_id)
      fetchCards(columnId)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao mover card' })
    }
  }

  const filteredColumns = columns.map((col) => ({
    ...col,
    cards: (cards[col.id] || []).filter(
      (card) =>
        card.title.toLowerCase().includes(search.toLowerCase()) ||
        card.description?.toLowerCase().includes(search.toLowerCase())
    ),
  }))

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Pesquisar tarefas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setShowNewColumn(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Coluna
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {filteredColumns.map((column) => (
          <div
            key={column.id}
            className="bg-gray-100 rounded-lg p-4 min-w-80 space-y-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">{column.name}</h3>
              <button
                onClick={() => deleteColumn(column.id)}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {column.cards.map((card: any) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card)}
                  className="bg-white p-3 rounded shadow cursor-move hover:shadow-lg transition"
                >
                  <div className="flex gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-sm text-sm font-semibold">{card.title}</p>
                      {card.type && (
                        <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded mt-1">
                          {card.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={() => openAddCard(column.id)}>
              <Plus className="h-3 w-3 mr-1" />
              Adicionar
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showNewColumn} onOpenChange={setShowNewColumn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Coluna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome da coluna"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addColumn()}
            />
            <Button onClick={addColumn} className="w-full">
              Criar Coluna
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input
                placeholder="Título do card"
                value={newCard.title}
                onChange={(e) => setNewCard((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição (opcional)"
                value={newCard.description}
                onChange={(e) => setNewCard((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={newCard.type} onValueChange={(v) => setNewCard((prev) => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Prioridade</Label>
                <Select value={newCard.priority} onValueChange={(v) => setNewCard((prev) => ({ ...prev, priority: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addCard} className="w-full" disabled={!newCard.title.trim()}>
              Criar Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
