'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

export function KanbanBoard({ projectId }: { projectId: string }) {
  const [columns, setColumns] = useState<any[]>([])
  const [cards, setCards] = useState<{ [key: string]: any[] }>({})
  const [search, setSearch] = useState('')
  const [draggedCard, setDraggedCard] = useState<any>(null)
  const [showNewColumn, setShowNewColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
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

            <Button variant="outline" size="sm" className="w-full">
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
            />
            <Button onClick={addColumn} className="w-full">
              Criar Coluna
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
