import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword, generateSessionToken } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password, nome } = await request.json()
    console.log('[v0] Register attempt:', { email, nome })

    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    console.log('[v0] Existing user check:', existingUser)
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    console.log('[v0] Password hashed successfully')

    const usuario = await sql`
      INSERT INTO users (email, password_hash, nome, ativo, created_at, updated_at)
      VALUES (${email}, ${passwordHash}, ${nome}, true, NOW(), NOW())
      RETURNING id, email, nome
    `
    console.log('[v0] User inserted:', usuario)

    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${usuario[0].id}, ${token}, ${expiresAt})
    `
    console.log('[v0] Session created for user:', usuario[0].id)

    const response = NextResponse.json(usuario[0], { status: 201 })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    console.log('[v0] Register successful for:', email)
    return response
  } catch (error) {
    console.error('[v0] Erro ao registrar:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar usuário' },
      { status: 500 }
    )
  }
}
