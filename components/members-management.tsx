'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'

export function MembersManagement({ projectId, open, onOpenChange }: any) {
  const [members, setMembers] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRole, setSelectedRole] = useState('QA')
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchMembers()
      fetchUsers()
    }
  }, [open])

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/project-members?projectId=${projectId}`)
      setMembers(await res.json())
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar membros' })
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      setAllUsers(await res.json())
    } catch (error) {
      console.error('Erro ao buscar usuários')
    }
  }

  const addMember = async () => {
    if (!selectedUser) return
    try {
      const res = await fetch('/api/project-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId: selectedUser,
          role: selectedRole,
        }),
      })
      if (res.ok) {
        setSelectedUser('')
        fetchMembers()
        toast({ title: 'Sucesso', description: 'Membro adicionado' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao adicionar membro' })
    }
  }

  const removeMember = async (memberId: string) => {
    try {
      await fetch(`/api/project-members?memberId=${memberId}`, { method: 'DELETE' })
      fetchMembers()
      toast({ title: 'Sucesso', description: 'Membro removido' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao remover membro' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Membros</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecionar usuário" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.nome || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Desenvolvedor">Dev</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
                <SelectItem value="PO">PO</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addMember}>Adicionar</Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center p-2 bg-gray-100 rounded"
              >
                <div>
                  <p className="font-sm text-sm">{member.nome}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
