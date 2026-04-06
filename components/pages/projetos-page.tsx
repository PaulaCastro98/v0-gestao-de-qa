'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectCreateModal } from '@/components/project-create-modal'
import { KanbanBoard } from '@/components/kanban-board'
import { MembersManagement } from '@/components/members-management'
import { useToast } from '@/hooks/use-toast'
import { Plus, Users, Trash2 } from 'lucide-react'

export default function ProjetosPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0])
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar projetos' })
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('Tem certeza que deseja deletar este projeto?')) return
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      setSelectedProject(null)
      fetchProjects()
      toast({ title: 'Sucesso', description: 'Projeto deletado' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao deletar projeto' })
    }
  }

  if (loading) {
    return <div className="p-8">Carregando projetos...</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projetos</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhum projeto criado ainda</p>
          <Button onClick={() => setShowCreateModal(true)}>Criar Primeiro Projeto</Button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {/* Project selector at the top */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
            <label className="text-sm font-medium text-gray-600">Projeto:</label>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find((p) => p.id.toString() === e.target.value)
                setSelectedProject(project || null)
              }}
              className="flex-1 max-w-xs px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

            {selectedProject && (
              <>
                <div className="flex justify-between items-start bg-white p-4 rounded-lg border">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                    {selectedProject.description && (
                      <p className="text-gray-600 text-sm mt-1">{selectedProject.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMembersModal(true)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Membros
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProject(selectedProject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="kanban" className="w-full">
                  <TabsList>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="info">Informações</TabsTrigger>
                  </TabsList>
                  <TabsContent value="kanban" className="bg-white p-4 rounded-lg border">
                    <KanbanBoard projectId={selectedProject.id.toString()} />
                  </TabsContent>
                  <TabsContent value="info" className="bg-white p-4 rounded-lg border">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">ID do Projeto</p>
                        <p className="font-mono text-sm">{selectedProject.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data de Criação</p>
                        <p className="text-sm">{new Date(selectedProject.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
        </div>
      )}

      <ProjectCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={fetchProjects}
      />

      {selectedProject && (
        <MembersManagement
          projectId={selectedProject.id}
          open={showMembersModal}
          onOpenChange={setShowMembersModal}
        />
      )}
    </div>
  )
}
