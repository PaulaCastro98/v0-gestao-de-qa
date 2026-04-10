import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClipboardList, BarChart3, Users, Shield } from 'lucide-react'

export default function Home() {
  const features = [
    { icon: ClipboardList, title: 'Casos de Teste', description: 'Crie e gerencie casos de teste estruturados com passos detalhados e resultados esperados', color: '#3b82f6' },
    { icon: BarChart3, title: 'Relatórios', description: 'Acompanhe métricas, taxa de aprovação e distribuição de casos por sprint', color: '#10b981' },
    { icon: Shield, title: 'Prioridades', description: 'Organize testes por nível de prioridade e acompanhe defeitos críticos', color: '#f59e0b' },
    { icon: Users, title: 'Rastreamento', description: 'Atribua testes a analistas e acompanhe o progresso em tempo real', color: '#8b5cf6' },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header Navigation */}
      <header style={{ backgroundColor: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white' }}
            >
              QA
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>QA Manager</h1>
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
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center space-y-6">
          <h2 
            className="text-5xl font-bold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Sistema de Gestão de QA
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-muted-foreground)' }}>
            Gerenciamento completo de casos de teste, rastreamento de defeitos e
            métricas de qualidade para equipes de QA
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/registro">
              <Button size="lg" variant="outline">Criar Conta</Button>
            </Link>
            <Link href="/login">
              <Button size="lg">Acessar Sistema</Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card key={i} className="p-6 hover:shadow-xl transition-all duration-300">
                <div className="space-y-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--color-foreground)' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                    {feature.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div 
          className="rounded-xl p-12 text-center space-y-4"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          <h3 className="text-3xl font-bold text-white">Pronto para começar?</h3>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
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
      <footer style={{ backgroundColor: 'var(--color-muted)', borderTop: '1px solid var(--color-border)' }} className="mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
          <p>© 2026 QA Manager. Sistema de Gestão de Qualidade.</p>
        </div>
      </footer>
    </main>
  )
}
