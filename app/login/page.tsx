'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log('[v0] Login attempt with email:', email)

    try {
      // CORREÇÃO AQUI: URL da API de login ajustada para /api/auth/login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      console.log('[v0] Login response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        console.log('[v0] Login error:', data)
        setError(data.error || 'Erro ao fazer login')
        return
      }

      // Redireciona para a página de casos de teste após o login bem-sucedido
      router.push('/casos-teste')
    } catch (err) {
      setError('Erro ao fazer login')
      console.error('[v0] Login exception:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-2">Acesso ao Sistema</h1>
          <p className="text-muted-foreground mb-6">
            Sistema de Gestão de Casos de Teste QA
          </p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Senha</FieldLabel>
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            <p>
              <Link href="/recuperar-senha" className="text-primary hover:underline">
                Esqueceu sua senha?
              </Link>
            </p>
            <p className="text-muted-foreground">
              Ainda nao tem conta?{' '}
              <Link href="/registro" className="text-primary hover:underline font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </main>
  )
}