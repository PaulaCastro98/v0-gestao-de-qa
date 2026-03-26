import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClipboardList, BarChart3, Users, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Navigation */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">QA Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/registro">
              <Button variant="outline">Cadastrar-se</Button>
            </Link>
            <Link href="/login">
              <Button>Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-bold text-slate-900">
            Sistema de Gestão de QA
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Gerenciamento completo de casos de teste, rastreamento de defeitos e
            métricas de qualidade para equipes de QA
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link href="/registro">
              <Button size="lg" variant="outline">Criar Conta</Button>
            </Link>
            <Link href="/login">
              <Button size="lg">Acessar Sistema</Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">Casos de Teste</h3>
              <p className="text-slate-600 text-sm">
                Crie e gerencie casos de teste estruturados com passos
                detalhados e resultados esperados
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Relatórios</h3>
              <p className="text-slate-600 text-sm">
                Acompanhe métricas, taxa de aprovação e distribuição de casos
                por sprint
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg">Prioridades</h3>
              <p className="text-slate-600 text-sm">
                Organize testes por nível de prioridade e acompanhe defeitos
                críticos
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg">Rastreamento</h3>
              <p className="text-slate-600 text-sm">
                Atribua testes a analistas e acompanhe o progresso em tempo
                real
              </p>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center text-white space-y-4">
          <h3 className="text-3xl font-bold">Pronto para começar?</h3>
          <p className="text-lg text-blue-100">
            Faça login para acessar o sistema de gestão QA
          </p>
          <div className="flex justify-center pt-4">
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Acessar Sistema
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-600">
          <p>© 2026 QA Manager. Sistema de Gestão de Qualidade.</p>
        </div>
      </footer>
    </main>
  )
}
