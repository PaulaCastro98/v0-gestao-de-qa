import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { verifyPassword, generateSessionToken } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Normalizar email (trim + lowercase)
    const emailNormalized = String(email).trim().toLowerCase()

    // Debug log temporário (remova em produção)
    console.log('Login attempt for:', emailNormalized)

    // Buscar usuário (case-insensitive)
    const usuarios = await sql`
      SELECT * FROM users WHERE LOWER(email) = ${emailNormalized}
    `

    if (!usuarios || usuarios.length === 0) {
      console.log('Login failed: user not found for', emailNormalized)
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const usuario = usuarios[0]

    if (!usuario.password_hash) {
      console.error('Login failed: user has no password_hash', usuario.id)
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar senha (verifyPassword deve retornar boolean)
    const passwordMatch = await verifyPassword(password, usuario.password_hash)
    if (!passwordMatch) {
      console.log('Login failed: invalid password for', emailNormalized)
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Criar sessão
    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${usuario.id}, ${token}, ${expiresAt})
    `

    const response = NextResponse.json(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
      },
      { status: 200 }
    )

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}