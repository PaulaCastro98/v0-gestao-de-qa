'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'

const ROLES = ['DEV', 'PO', 'QA', 'UX', 'Scrum']
const ROLE_COLORS: { [key: string]: string } = {
  DEV: 'bg-blue-100 text-blue-800',
  PO: 'bg-purple-100 text-purple-800',
  QA: 'bg-green-100 text-green-800',
  UX: 'bg-pink-100 text-pink-800',
  Scrum: 'bg-orange-100 text-orange-800',
}

export function MembersManagement({ projectId, open, onOpenChange }: any) {
  const [members, setMembers] = useState<any[]>([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('DEV')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/project-members?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar membros' })
    } finally {
      setLoading(false)
    }
  }

  const addMember = async () => {
    if (!newMemberName.trim()) {
      toast({ title: 'Erro', description: 'Digite o nome do membro' })
      return
    }

    try {
      const res = await fetch('/api/project-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          nome: newMemberName.trim(),
          role: newMemberRole,
        }),
      })
      
      if (res.ok) {
        setNewMemberName('')
        setNewMemberRole('DEV')
        fetchMembers()
        toast({ title: 'Sucesso', description: 'Membro adicionado' })
      } else {
        const err = await res.json()
        toast({ title: 'Erro', description: err.error || 'Falha ao adicionar' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao adicionar membro' })
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return
    
    try {
      const res = await fetch(`/api/project-members?memberId=${memberId}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        fetchMembers()
        toast({ title: 'Sucesso', description: 'Membro removido' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao remover membro' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Adicionar novo membro */}
          <div className="space-y-3 pb-4 border-b">
            <h3 className="font-semibold text-sm">Adicionar Novo Membro</h3>
            
            <div className="space-y-2">
              <Label htmlFor="member-name">Nome</Label>
              <Input
                id="member-name"
                placeholder="Ex: João Silva"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMember()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-role">Função</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger id="member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={addMember} className="w-full" disabled={!newMemberName.trim()}>
              Adicionar Membro
            </Button>
          </div>

          {/* Lista de membros */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Membros do Projeto ({members.length})</h3>
            
            {loading ? (
              <p className="text-sm text-gray-500">Carregando...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum membro adicionado</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {member.avatar_initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{member.nome}</p>
                        <Badge className={`text-xs ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-800'}`}>
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-gray-400 hover:text-red-500 transition flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
