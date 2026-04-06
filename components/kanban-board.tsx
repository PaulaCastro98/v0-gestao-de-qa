'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CardDetailModal } from '@/components/card-detail-modal'
import { useToast } from '@/hooks/use-toast'
import { GripVertical, Plus, Trash2, Github, Loader2 } from 'lucide-react'

const CARD_TYPES = ['Sprint', 'Epico', 'Historia', 'Feature', 'Bug', 'Tarefa']
const CARD_PRIORITIES = ['Baixa', 'Media', 'Alta']

export function KanbanBoard({ projectId }: { projectId: string }) {
  const [columns, setColumns] = useState<any[]>([])
  const [cards, setCards] = useState<{ [key: string]: any[] }>({})
  const [members, setMembers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [draggedCard, setDraggedCard] = useState<any>(null)
  const [showNewColumn, setShowNewColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [showAddCard, setShowAddCard] = useState(false)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    type: 'Tarefa',
    situacaoColumnId: '',
    tipoTrabalho: '',
    prioridadeNum: '',
    sprintNum: '',
    responsaveis: [] as string[],
    estimativa: [] as string[],
  })
  const [newEstimativa, setNewEstimativa] = useState('')
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showCardDetail, setShowCardDetail] = useState(false)
  const [importingGithub, setImportingGithub] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchColumns()
    fetchMembers()
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

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/project-members?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Erro ao buscar membros:', error)
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
    setNewCard({ title: '', description: '', type: 'Tarefa', situacaoColumnId: columnId, tipoTrabalho: '', prioridadeNum: '', sprintNum: '', responsaveis: [], estimativa: [] })
    setNewEstimativa('')
    setShowAddCard(true)
  }

  const addCard = async () => {
    if (!newCard.title.trim()) return
    const targetColumnId = newCard.situacaoColumnId || activeColumnId
    if (!targetColumnId) return
    try {
      const res = await fetch('/api/kanban/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: targetColumnId,
          title: newCard.title,
          description: newCard.description,
          type: newCard.type,
          priority: null,
          position: cards[targetColumnId]?.length || 0,
          tipoTrabalho: newCard.tipoTrabalho || null,
          prioridadeNum: newCard.prioridadeNum ? parseInt(newCard.prioridadeNum) : null,
          sprintNum: newCard.sprintNum ? parseInt(newCard.sprintNum) : null,
          responsaveis: newCard.responsaveis,
          estimativa: newCard.estimativa,
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

  const updateCard = async (updatedCard: any) => {
    try {
      const res = await fetch('/api/kanban/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard),
      })
      if (res.ok) {
        if (selectedCard?.column_id) fetchCards(selectedCard.column_id)
        toast({ title: 'Sucesso', description: 'Card atualizado' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar card' })
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      await fetch(`/api/kanban/cards?cardId=${cardId}`, { method: 'DELETE' })
      if (selectedCard?.column_id) fetchCards(selectedCard.column_id)
      toast({ title: 'Sucesso', description: 'Card deletado' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao deletar card' })
    }
  }

  const handleDragStart = (card: any) => {
    setDraggedCard(card)
  }

  const handleDrop = async (columnId: string) => {
    if (!draggedCard) return
    const fromColumnId = draggedCard.column_id
    try {
      await fetch('/api/kanban/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: draggedCard.id,
          title: draggedCard.title,
          description: draggedCard.description,
          columnId,
          position: (cards[columnId]?.length || 0),
          responsaveis: draggedCard.responsaveis || [],
          prioridadeNum: draggedCard.prioridade_num,
          sprintNum: draggedCard.sprint_num,
          estimativa: draggedCard.estimativa || [],
          tipoTrabalho: draggedCard.tipo_trabalho,
        }),
      })
      setDraggedCard(null)
      fetchCards(fromColumnId)
      fetchCards(columnId)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao mover card' })
    }
  }

  const importFromGithub = async () => {
    setImportingGithub(true)
    try {
      const res = await fetch('/api/github/project')
      if (!res.ok) {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha ao buscar projeto do GitHub' })
        return
      }

      const { cards: githubCards, columns: githubColumnNames } = await res.json()

      // Build a map: GitHub status name -> kanban column id
      const statusToColumnId: Record<string, string> = {}

      for (let i = 0; i < githubColumnNames.length; i++) {
        const ghColName: string = githubColumnNames[i]

        // Check if a column with this exact name already exists
        const existing = columns.find(
          (c: any) => (c.name || c.title || '').toLowerCase() === ghColName.toLowerCase()
        )

        if (existing) {
          statusToColumnId[ghColName] = existing.id
        } else {
          // Create the column exactly as it is in GitHub
          const colRes = await fetch('/api/kanban/columns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: ghColName, position: columns.length + i }),
          })
          if (colRes.ok) {
            const newCol = await colRes.json()
            statusToColumnId[ghColName] = newCol.id
          }
        }
      }

      // Refresh columns in UI
      await fetchColumns()

      // Re-fetch columns to get final state
      let currentColumns = columns
      const colsRes = await fetch('/api/kanban/columns')
      if (colsRes.ok) currentColumns = await colsRes.json()

      // Fallback: find column id by status name (case-insensitive)
      const getColumnId = (status: string): string | undefined => {
        if (statusToColumnId[status]) return statusToColumnId[status]
        const match = currentColumns.find(
          (c: any) => (c.name || c.title || '').toLowerCase() === status.toLowerCase()
        )
        return match?.id || currentColumns[0]?.id
      }

      let importedCount = 0
      for (const card of githubCards) {
        const columnId = getColumnId(card.status)
        if (!columnId) continue

        const response = await fetch('/api/kanban/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            columnId,
            title: card.title,
            description: card.description,
            type: card.type,
            priority: null,
            position: 0,
            responsaveis: card.responsaveis,
            estimativa: [],
            tipoTrabalho: null,
            prioridadeNum: null,
            sprintNum: null,
          }),
        })
        if (response.ok) {
          importedCount++
        }
      }

      await fetchColumns()
      toast({ title: 'Sucesso', description: `${importedCount} cards importados do GitHub` })
    } catch (error) {
      console.error('[v0] Error importing from GitHub:', error)
      toast({ title: 'Erro', description: 'Falha ao importar do GitHub' })
    } finally {
      setImportingGithub(false)
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
        <Button variant="outline" onClick={importFromGithub} disabled={importingGithub}>
          {importingGithub ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Github className="h-4 w-4 mr-2" />
          )}
          Importar do GitHub
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
                  onClick={() => {
                    setSelectedCard(card)
                    setShowCardDetail(true)
                  }}
                  draggable
                  onDragStart={() => handleDragStart(card)}
                  className="bg-white p-3 rounded shadow cursor-pointer hover:shadow-lg hover:bg-blue-50 transition"
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
                      {card.responsaveis?.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {card.responsaveis.slice(0, 2).map((resp: string, i: number) => (
                            <span key={i} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              {resp}
                            </span>
                          ))}
                          {card.responsaveis.length > 2 && (
                            <span className="text-xs text-gray-600">+{card.responsaveis.length - 2}</span>
                          )}
                        </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">

            {/* Título */}
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input
                placeholder="Título da tarefa"
                value={newCard.title}
                onChange={(e) => setNewCard((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição (opcional)"
                value={newCard.description}
                onChange={(e) => setNewCard((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Tipo + Prioridade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={newCard.type} onValueChange={(v) => setNewCard((prev) => ({ ...prev, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Situação (Coluna)</Label>
                <Select value={newCard.situacaoColumnId} onValueChange={(v) => setNewCard((prev) => ({ ...prev, situacaoColumnId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a coluna" /></SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id.toString()}>{col.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo de Trabalho + Prioridade Numérica + Sprint */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Tipo de Trabalho</Label>
                <Input
                  placeholder="Ex: Feature, Hotfix..."
                  value={newCard.tipoTrabalho}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, tipoTrabalho: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Prioridade (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1"
                  value={newCard.prioridadeNum}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, prioridadeNum: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Sprint #</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={newCard.sprintNum}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, sprintNum: e.target.value }))}
                />
              </div>
            </div>

            {/* Responsáveis */}
            <div className="space-y-2">
              <Label>Responsáveis</Label>
              <div className="flex gap-1 flex-wrap">
                {newCard.responsaveis.map((resp, idx) => {
                  const member = members.find(m => m.nome === resp)
                  return (
                    <span key={idx} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {resp}
                      <button onClick={() => setNewCard((prev) => ({ ...prev, responsaveis: prev.responsaveis.filter((_, i) => i !== idx) }))}>
                        <span className="text-blue-600 hover:text-red-600">×</span>
                      </button>
                    </span>
                  )
                })}
              </div>
              <div className="space-y-1 border rounded p-2 bg-gray-50 max-h-40 overflow-y-auto">
                {members.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={newCard.responsaveis.includes(member.nome)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewCard((prev) => ({ ...prev, responsaveis: [...prev.responsaveis, member.nome] }))
                        } else {
                          setNewCard((prev) => ({ ...prev, responsaveis: prev.responsaveis.filter(r => r !== member.nome) }))
                        }
                      }}
                    />
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {member.avatar_initials}
                    </div>
                    <span className="text-sm">{member.nome}</span>
                    <span className="text-xs text-gray-600 ml-auto">{member.role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estimativa */}
            <div className="space-y-2">
              <Label>Estimativa</Label>
              <div className="flex gap-1 flex-wrap">
                {newCard.estimativa.map((est, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border">
                    {est}
                    <button onClick={() => setNewCard((prev) => ({ ...prev, estimativa: prev.estimativa.filter((_, i) => i !== idx) }))}>
                      <span className="text-gray-600 hover:text-red-600">×</span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: 5 pontos, 2 horas..."
                  value={newEstimativa}
                  onChange={(e) => setNewEstimativa(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newEstimativa.trim()) {
                      setNewCard((prev) => ({ ...prev, estimativa: [...prev.estimativa, newEstimativa.trim()] }))
                      setNewEstimativa('')
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (newEstimativa.trim()) {
                      setNewCard((prev) => ({ ...prev, estimativa: [...prev.estimativa, newEstimativa.trim()] }))
                      setNewEstimativa('')
                    }
                  }}
                >
                  Adicionar
                </Button>
              </div>
            </div>

            <Button onClick={addCard} className="w-full" disabled={!newCard.title.trim()}>
              Criar Tarefa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CardDetailModal
        card={selectedCard}
        columns={columns}
        open={showCardDetail}
        onOpenChange={setShowCardDetail}
        onUpdate={async (updatedCard: any) => {
          const oldColumnId = selectedCard.column_id
          await updateCard({
            cardId: selectedCard.id,
            ...updatedCard
          })
          // Refresh both old and new columns if changed
          if (updatedCard.columnId !== oldColumnId) {
            fetchCards(oldColumnId)
            fetchCards(updatedCard.columnId)
          } else {
            fetchCards(oldColumnId)
          }
          setShowCardDetail(false)
        }}
        onDelete={async (cardId: string) => {
          await deleteCard(cardId)
          setShowCardDetail(false)
        }}
      />
    </div>
  )
}
