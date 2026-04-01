// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { verifyPassword, generateSessionToken } from '@/lib/auth' // Certifique-se que lib/auth.ts está corrigido

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário, incluindo o campo que armazena o hash da senha (assumindo 'password_hash')
    const usuarios = await sql`SELECT id, email, nome, password_hash FROM users WHERE email = ${email}` // <sources>[1,2,3]</sources>
    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const usuario = usuarios[0]

    // Verificar senha usando o hash completo (hash:salt) armazenado
    // 'usuario.password_hash' deve conter o valor no formato "hash:salt"
    const passwordMatch = await verifyPassword(password, usuario.password_hash) // <sources>[1,2,3]</sources>
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Criar sessão
    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias de expiração

    // Inserir a sessão no banco de dados
    // Ajuste os nomes das colunas se forem diferentes no seu schema (ex: user_id, token, expires_at)
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${usuario.id}, ${token}, ${expiresAt})
    ` // <sources>[1,2,3]</sources>

    const response = NextResponse.json(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
      },
      { status: 200 }
    )

    // Definir o cookie de autenticação
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use 'secure' apenas em produção (HTTPS)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
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