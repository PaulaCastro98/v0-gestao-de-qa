'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { X, Trash2 } from 'lucide-react'

export function CardDetailModal({ card, columns, open, onOpenChange, onUpdate, onDelete }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(card || {})
  const [newResponsavel, setNewResponsavel] = useState('')
  const [newEstimativa, setNewEstimativa] = useState('')
  const { toast } = useToast()

  // Sincroniza formData quando card mudar
  useEffect(() => {
    if (card) {
      setFormData(card)
      setIsEditing(false)
    }
  }, [card])

  if (!card) return null

  const handleSave = async () => {
    try {
      // Mapeia campos snake_case para camelCase esperado pela API
      const payload = {
        title: formData.title,
        description: formData.description,
        columnId: formData.column_id,
        position: formData.position,
        responsaveis: formData.responsaveis || [],
        prioridadeNum: formData.prioridade_num,
        sprintNum: formData.sprint_num,
        estimativa: formData.estimativa || [],
        tipoTrabalho: formData.tipo_trabalho,
      }
      await onUpdate(payload)
      setIsEditing(false)
      toast({ title: 'Sucesso', description: 'Card atualizado' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar' })
    }
  }

  const addResponsavel = () => {
    if (!newResponsavel.trim()) return
    setFormData((prev: any) => ({
      ...prev,
      responsaveis: [...(prev.responsaveis || []), newResponsavel]
    }))
    setNewResponsavel('')
  }

  const removeResponsavel = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      responsaveis: prev.responsaveis.filter((_: string, i: number) => i !== index)
    }))
  }

  const addEstimativa = () => {
    if (!newEstimativa.trim()) return
    setFormData((prev: any) => ({
      ...prev,
      estimativa: [...(prev.estimativa || []), newEstimativa]
    }))
    setNewEstimativa('')
  }

  const removeEstimativa = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      estimativa: prev.estimativa.filter((_: string, i: number) => i !== index)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>{isEditing ? 'Editar Card' : 'Detalhes do Card'}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (isEditing ? setIsEditing(false) : onOpenChange(false))}
          >
            ✕
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div className="space-y-1">
            <Label>Título</Label>
            {isEditing ? (
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              />
            ) : (
              <p className="text-sm font-medium">{formData.title}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <Label>Descrição</Label>
            {isEditing ? (
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-600">{formData.description || 'Sem descrição'}</p>
            )}
          </div>

          {/* Grid 2 colunas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tipo de Trabalho */}
            <div className="space-y-1">
              <Label>Tipo de Trabalho</Label>
              {isEditing ? (
                <Input
                  value={formData.tipo_trabalho || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, tipo_trabalho: e.target.value }))}
                />
              ) : (
                <p className="text-sm">{formData.tipo_trabalho || '-'}</p>
              )}
            </div>

            {/* Prioridade Numérica */}
            <div className="space-y-1">
              <Label>Prioridade (1-10)</Label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.prioridade_num || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, prioridade_num: parseInt(e.target.value) }))}
                />
              ) : (
                <p className="text-sm">{formData.prioridade_num || '-'}</p>
              )}
            </div>

            {/* Sprint Numérico */}
            <div className="space-y-1">
              <Label>Sprint #</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.sprint_num || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, sprint_num: parseInt(e.target.value) }))}
                />
              ) : (
                <p className="text-sm">{formData.sprint_num || '-'}</p>
              )}
            </div>

            {/* Situação (Coluna) */}
            <div className="space-y-1">
              <Label>Situação (Coluna)</Label>
              {isEditing ? (
                <Select 
                  value={formData.column_id?.toString() || ''} 
                  onValueChange={(v) => setFormData((prev: any) => ({ ...prev, column_id: parseInt(v) }))}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione a coluna" /></SelectTrigger>
                  <SelectContent>
                    {columns?.map((col: any) => (
                      <SelectItem key={col.id} value={col.id.toString()}>{col.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-medium">
                  {columns?.find((col: any) => col.id === formData.column_id)?.name || '-'}
                </p>
              )}
            </div>
          </div>

          {/* Responsáveis */}
          <div className="space-y-2">
            <Label>Responsáveis</Label>
            <div className="flex gap-2 flex-wrap">
              {formData.responsaveis?.map((resp: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="flex gap-1 items-center">
                  {resp}
                  {isEditing && (
                    <button
                      onClick={() => removeResponsavel(idx)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar membro..."
                  value={newResponsavel}
                  onChange={(e) => setNewResponsavel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addResponsavel()}
                />
                <Button size="sm" onClick={addResponsavel}>
                  Adicionar
                </Button>
              </div>
            )}
          </div>

          {/* Estimativa */}
          <div className="space-y-2">
            <Label>Estimativa</Label>
            <div className="flex gap-2 flex-wrap">
              {formData.estimativa?.map((est: string, idx: number) => (
                <Badge key={idx} variant="outline" className="flex gap-1 items-center">
                  {est}
                  {isEditing && (
                    <button
                      onClick={() => removeEstimativa(idx)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: 5 pontos, 2 horas..."
                  value={newEstimativa}
                  onChange={(e) => setNewEstimativa(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEstimativa()}
                />
                <Button size="sm" onClick={addEstimativa}>
                  Adicionar
                </Button>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex-1">
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} className="flex-1">
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja deletar este card?')) {
                      onDelete(card.id)
                      onOpenChange(false)
                    }
                  }}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
