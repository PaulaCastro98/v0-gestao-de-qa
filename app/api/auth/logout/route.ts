import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
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

    // Deletar sessão
    await sql`DELETE FROM sessions WHERE token = ${token}`

    const response = NextResponse.json(
      { message: 'Logout realizado com sucesso' },
      { status: 200 }
    )

    response.cookies.delete('auth_token')
    return response
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    )
  }
}
