import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword, isTokenExpired } from '@/lib/auth'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar token
    const tokens = await sql`
      SELECT * FROM password_reset_tokens 
      WHERE token = ${token} AND used = false
    `

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    const resetToken = tokens[0]

    // Verificar se token expirou
    if (isTokenExpired(new Date(resetToken.expires_at))) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const passwordHash = await hashPassword(password)

    // Atualizar senha e marcar token como usado
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}
      WHERE id = ${resetToken.user_id}
    `

    await sql`
      UPDATE password_reset_tokens 
      SET used = true
      WHERE id = ${resetToken.id}
    `

    return NextResponse.json(
      { message: 'Senha alterada com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro ao resetar senha' },
      { status: 500 }
    )
  }
}
