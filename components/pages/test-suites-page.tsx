'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, Pencil, Trash2, FolderOpen, ChevronRight, ChevronDown, 
  Hand, ArrowUp, ArrowDown, Minus, MoreHorizontal, FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TestCase {
  id: number
  title?: string
  titulo_tc?: string
  priority?: string
  prioridade_teste?: string
  type?: string
  tipo_teste?: string
  status?: string
  status_teste?: string
  suite_id?: number
}

interface Suite {
  id: number
  name: string
  description?: string
  pre_condition?: string
  test_cases?: TestCase[]
}

export default function TestSuitesPage() {
  const [suites, setSuites] = useState<Suite[]>([])
  const [allTestCases, setAllTestCases] = useState<TestCase[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSuites, setExpandedSuites] = useState<Set<number>>(new Set())
  
  // Modals
  const [showSuiteModal, setShowSuiteModal] = useState(false)
  const [showAddCaseModal, setShowAddCaseModal] = useState(false)
  const [editingSuite, setEditingSuite] = useState<Suite | null>(null)
  const [targetSuiteId, setTargetSuiteId] = useState<number | null>(null)
  
  const [suiteForm, setSuiteForm] = useState({ name: '', description: '', preCondition: '' })
  const [selectedCases, setSelectedCases] = useState<Set<number>>(new Set())
  
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [suitesRes, casesRes] = await Promise.all([
        fetch('/api/test-suites'),
        fetch('/api/test-cases')
      ])
      
      if (suitesRes.ok && casesRes.ok) {
        const suitesData = await suitesRes.json()
        const casesData = await casesRes.json()
        
        // Group test cases by suite
        const suitesWithCases = suitesData.map((suite: Suite) => ({
          ...suite,
          test_cases: casesData.filter((tc: TestCase) => tc.suite_id === suite.id)
        }))
        
        setSuites(suitesWithCases)
        setAllTestCases(casesData)
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar dados' })
    } finally {
      setLoading(false)
    }
  }

  const toggleSuite = (suiteId: number) => {
    setExpandedSuites(prev => {
      const next = new Set(prev)
      if (next.has(suiteId)) {
        next.delete(suiteId)
      } else {
        next.add(suiteId)
      }
      return next
    })
  }

  const openCreateSuite = () => {
    setEditingSuite(null)
    setSuiteForm({ name: '', description: '', preCondition: '' })
    setShowSuiteModal(true)
  }

  const openEditSuite = (suite: Suite) => {
    setEditingSuite(suite)
    setSuiteForm({
      name: suite.name,
      description: suite.description || '',
      preCondition: suite.pre_condition || ''
    })
    setShowSuiteModal(true)
  }

  const handleSuiteSubmit = async () => {
    if (!suiteForm.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório' })
      return
    }

    try {
      const method = editingSuite ? 'PUT' : 'POST'
      const body = editingSuite
        ? { id: editingSuite.id, ...suiteForm }
        : suiteForm

      const res = await fetch('/api/test-suites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowSuiteModal(false)
        fetchData()
        toast({ title: 'Sucesso', description: editingSuite ? 'Suite atualizada' : 'Suite criada' })
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha na operação' })
    }
  }

  const handleDeleteSuite = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta suite e desvincular todos os casos?')) return

    try {
      const res = await fetch(`/api/test-suites?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        toast({ title: 'Sucesso', description: 'Suite excluída' })
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir' })
    }
  }

  const openAddCaseModal = (suiteId: number) => {
    setTargetSuiteId(suiteId)
    setSelectedCases(new Set())
    setShowAddCaseModal(true)
  }

  const handleAddCasesToSuite = async () => {
    if (!targetSuiteId || selectedCases.size === 0) return

    try {
      // Update each selected test case to belong to this suite
      const promises = Array.from(selectedCases).map(caseId =>
        fetch(`/api/test-cases/${caseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suite_id: targetSuiteId }),
        })
      )
      
      await Promise.all(promises)
      setShowAddCaseModal(false)
      fetchData()
      toast({ title: 'Sucesso', description: `${selectedCases.size} caso(s) adicionado(s) à suite` })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao adicionar casos' })
    }
  }

  const removeCaseFromSuite = async (caseId: number) => {
    if (!confirm('Remover este caso da suite?')) return

    try {
      await fetch(`/api/test-cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite_id: null }),
      })
      fetchData()
      toast({ title: 'Sucesso', description: 'Caso removido da suite' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover caso' })
    }
  }

  const getPriorityIcon = (priority?: string) => {
    const p = priority?.toLowerCase()
    if (p === 'alta' || p === 'high' || p === 'crítica' || p === 'critica') {
      return <ArrowUp className="w-4 h-4 text-red-500" />
    }
    if (p === 'média' || p === 'media' || p === 'medium') {
      return <Minus className="w-4 h-4 text-yellow-500" />
    }
    return <ArrowDown className="w-4 h-4 text-green-500" />
  }

  const getTestCaseTitle = (tc: TestCase) => tc.title || tc.titulo_tc || 'Sem título'
  const getTestCasePriority = (tc: TestCase) => tc.priority || tc.prioridade_teste || 'Média'
  const getTestCaseType = (tc: TestCase) => tc.type || tc.tipo_teste || 'Manual'

  // Cases not assigned to any suite (available to add)
  const unassignedCases = allTestCases.filter(tc => !tc.suite_id)

  // Total counts
  const totalCases = allTestCases.length
  const totalSuites = suites.length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            Test Repository
            <Badge variant="secondary" className="font-normal text-sm">
              {totalCases} cases | {totalSuites} suites
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">Organize seus casos de teste em suites</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateSuite}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Suite
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-center py-12">Carregando...</p>
        </Card>
      ) : suites.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma test suite criada ainda</p>
            <Button onClick={openCreateSuite} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira suite
            </Button>
          </div>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_40px_40px_1fr_120px_100px_60px] gap-2 px-4 py-3 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
            <div></div>
            <div></div>
            <div>Prio</div>
            <div>Nome</div>
            <div>Tipo</div>
            <div>Status</div>
            <div></div>
          </div>

          {/* Suites List */}
          {suites.map((suite) => {
            const isExpanded = expandedSuites.has(suite.id)
            const casesCount = suite.test_cases?.length || 0

            return (
              <Collapsible key={suite.id} open={isExpanded} onOpenChange={() => toggleSuite(suite.id)}>
                {/* Suite Row */}
                <div className="grid grid-cols-[40px_40px_40px_1fr_120px_100px_60px] gap-2 px-4 py-3 border-b bg-muted/30 hover:bg-muted/50 transition-colors items-center">
                  <CollapsibleTrigger asChild>
                    <button className="p-1 hover:bg-muted rounded">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <div>
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <div></div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{suite.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {casesCount} {casesCount === 1 ? 'caso' : 'casos'}
                    </Badge>
                  </div>
                  <div></div>
                  <div></div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        openAddCaseModal(suite.id)
                      }}
                      title="Adicionar caso de teste"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditSuite(suite)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar Suite
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSuite(suite.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir Suite
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Test Cases inside Suite */}
                <CollapsibleContent>
                  {suite.test_cases && suite.test_cases.length > 0 ? (
                    suite.test_cases.map((tc) => (
                      <div 
                        key={tc.id}
                        className="grid grid-cols-[40px_40px_40px_1fr_120px_100px_60px] gap-2 px-4 py-2.5 border-b hover:bg-muted/30 transition-colors items-center pl-12"
                      >
                        <div>
                          <Checkbox />
                        </div>
                        <div>
                          <Hand className="w-4 h-4 text-muted-foreground" title={getTestCaseType(tc)} />
                        </div>
                        <div>{getPriorityIcon(getTestCasePriority(tc))}</div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{getTestCaseTitle(tc)}</span>
                        </div>
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {getTestCaseType(tc)}
                          </Badge>
                        </div>
                        <div>
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {tc.status || tc.status_teste || 'Pendente'}
                          </Badge>
                        </div>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => removeCaseFromSuite(tc.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover da Suite
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-muted-foreground text-sm border-b bg-muted/10">
                      Nenhum caso de teste nesta suite.{' '}
                      <button 
                        className="text-primary hover:underline"
                        onClick={() => openAddCaseModal(suite.id)}
                      >
                        Adicionar casos
                      </button>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      )}

      {/* Suite Modal */}
      <Dialog open={showSuiteModal} onOpenChange={setShowSuiteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSuite ? 'Editar Suite' : 'Nova Suite'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome da suite"
                value={suiteForm.name}
                onChange={(e) => setSuiteForm({ ...suiteForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição da suite"
                value={suiteForm.description}
                onChange={(e) => setSuiteForm({ ...suiteForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Pré-condições</Label>
              <Textarea
                placeholder="Pré-condições para execução"
                value={suiteForm.preCondition}
                onChange={(e) => setSuiteForm({ ...suiteForm, preCondition: e.target.value })}
                rows={2}
              />
            </div>
            <Button onClick={handleSuiteSubmit} className="w-full">
              {editingSuite ? 'Salvar Alterações' : 'Criar Suite'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Cases to Suite Modal */}
      <Dialog open={showAddCaseModal} onOpenChange={setShowAddCaseModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Adicionar Casos de Teste à Suite</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {unassignedCases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Todos os casos de teste já estão vinculados a suites.</p>
                <p className="text-sm mt-1">Crie novos casos na página de Test Cases.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Selecione os casos de teste que deseja adicionar:
                </p>
                <div className="max-h-[400px] overflow-y-auto border rounded-lg divide-y">
                  {unassignedCases.map((tc) => (
                    <label 
                      key={tc.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedCases.has(tc.id)}
                        onCheckedChange={(checked) => {
                          setSelectedCases(prev => {
                            const next = new Set(prev)
                            if (checked) {
                              next.add(tc.id)
                            } else {
                              next.delete(tc.id)
                            }
                            return next
                          })
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{getTestCaseTitle(tc)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getTestCaseType(tc)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getTestCasePriority(tc)}
                          </Badge>
                        </div>
                      </div>
                      {getPriorityIcon(getTestCasePriority(tc))}
                    </label>
                  ))}
                </div>
                <Button 
                  onClick={handleAddCasesToSuite} 
                  className="w-full"
                  disabled={selectedCases.size === 0}
                >
                  Adicionar {selectedCases.size} caso(s) selecionado(s)
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
