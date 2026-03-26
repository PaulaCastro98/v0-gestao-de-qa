import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword, generateSessionToken } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    // Alterado: Desestruturando 'nome' em vez de 'nome_completo'
    const { email, password, nome } = await request.json()

    // Validar entrada
    // Alterado: Verificando 'nome' em vez de 'nome_completo'
    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    // Hash da senha
    const passwordHash = await hashPassword(password)

    // Criar usuário
    // Alterado: Usando 'nome' na instrução INSERT e RETURNING
    const usuario = await sql`
      INSERT INTO users (email, password_hash, nome)
      VALUES (${email}, ${passwordHash}, ${nome})
      RETURNING id, email, nome
    `

    // Criar sessão
    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${usuario[0].id}, ${token}, ${expiresAt})
    `

    const response = NextResponse.json(usuario[0], { status: 201 })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Erro ao registrar:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar usuário' },
      { status: 500 }
    )
  }
}