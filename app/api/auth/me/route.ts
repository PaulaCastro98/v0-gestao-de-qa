import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar sessão
    const sessions = await sql`
      SELECT user_id FROM sessions 
      WHERE token = ${token} AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'Sessão inválida' },
        { status: 401 }
      )
    }

    // Buscar dados do usuário
    const usuarios = await sql`
      SELECT id, email, nome_completo FROM users 
      WHERE id = ${sessions[0].user_id}
    `

    return NextResponse.json(usuarios[0], { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}
