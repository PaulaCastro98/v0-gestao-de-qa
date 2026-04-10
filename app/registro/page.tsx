'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Senhas não coincidem')
      return
    }

    setLoading(true)
    console.log('[v0] Starting registration with:', { email, nome })

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nome }),
      })

      console.log('[v0] Register response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        console.log('[v0] Register error:', data)
        setError(data.error || 'Erro ao registrar')
        return
      }

      const userData = await response.json()
      console.log('[v0] Register success:', userData)
      router.push('/casos-teste')
    } catch (err) {
      setError('Erro ao registrar')
      console.error('[v0] Register exception:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white'
              }}
            >
              QA
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Criar Conta</h1>
              <p style={{ color: 'var(--color-muted-foreground)' }} className="text-sm">
                Sistema de Gestão de QA
              </p>
            </div>
          </div>

          {error && (
            <div 
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Nome Completo</FieldLabel>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

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
                  placeholder="Escolha uma senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel>Confirmar Senha</FieldLabel>
                <Input
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Criar Conta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: '#3b82f6' }} className="hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </Card>
    </main>
  )
}
