// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { verifyPassword, generateSessionToken } from '@/lib/auth' // Certifique-se que lib/auth.ts está corrigido

const sql = neon(process.env.DATABASE_URL!)

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('[Login API] Tentativa de login para:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário, incluindo o campo que armazena o hash da senha (assumindo 'password_hash')
    const usuarios = await sql`SELECT id, email, nome, password_hash FROM users WHERE email = ${email}`

    if (usuarios.length === 0) {
      console.log('[Login API] Email não encontrado:', email)
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const usuario = usuarios[0]

    if (!usuario.password_hash) {
      console.error('[Login API] Erro: Usuário sem password_hash registrado:', usuario.id)
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar senha usando o hash completo (hash:salt) armazenado
    const passwordMatch = await verifyPassword(password, usuario.password_hash)

    if (!passwordMatch) {
      console.log('[Login API] Senha incorreta para:', email)
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Criar sessão
    const token = generateSessionToken(usuario.id) // Passa o ID do usuário para o token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias de expiração

    // Inserir a sessão no banco de dados
    // Ajuste os nomes das colunas se forem diferentes no seu schema (ex: user_id, token, expires_at)
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${usuario.id}, ${token}, ${expiresAt})
    `
    console.log('[Login API] Sessão criada para o usuário:', usuario.id)

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

    console.log('[Login API] Login bem-sucedido para:', email)
    return response
  } catch (error) {
    console.error('[Login API] Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao fazer login' }, // Mensagem mais genérica para o cliente
      { status: 500 }
    )
  }
}