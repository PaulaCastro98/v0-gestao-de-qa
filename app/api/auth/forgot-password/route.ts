import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { generateResetToken } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const usuarios = await sql`SELECT id FROM users WHERE email = ${email}`
    if (usuarios.length === 0) {
      // Não revelar se email existe ou não
      return NextResponse.json(
        { message: 'Se o email existe, um link de recuperação foi enviado' },
        { status: 200 }
      )
    }

    // Gerar token de reset
    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hora

    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${usuarios[0].id}, ${token}, ${expiresAt})
    `

    // Em produção, enviar email com link
    // Para desenvolvimento, apenas retornar sucesso
    console.log(
      `Link de recuperação: ${process.env.NEXTAUTH_URL}/recuperar-senha?token=${token}`
    )

    return NextResponse.json(
      { message: 'Se o email existe, um link de recuperação foi enviado' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao solicitar recuperação:', error)
    return NextResponse.json(
      { error: 'Erro ao solicitar recuperação de senha' },
      { status: 500 }
    )
  }
}
