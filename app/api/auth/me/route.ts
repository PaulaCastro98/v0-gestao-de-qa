import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      // Se não houver token, o usuário não está autenticado.
      return NextResponse.json(
        { error: 'Não autenticado. Token ausente.' },
        { status: 401 }
      )
    }

    // Buscar sessão no banco de dados
    // Certifique-se de que a tabela 'sessions' e as colunas 'user_id', 'token', 'expires_at' existem.
    const sessions = await sql`
      SELECT user_id FROM sessions
      WHERE token = ${token} AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      // Se nenhuma sessão válida for encontrada, o token é inválido ou expirado.
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada.' },
        { status: 401 }
      )
    }

    // Buscar dados do usuário com base no user_id da sessão
    // Certifique-se de que a tabela 'users' e as colunas 'id', 'email', 'nome' existem.
    const usuarios = await sql`
      SELECT id, email, nome FROM users
      WHERE id = ${sessions[0].user_id}
    `

    if (usuarios.length === 0) {
      // Se o usuário não for encontrado (o que seria incomum se a sessão é válida)
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 } // 404 Not Found é mais apropriado aqui
      )
    }

    // Retorna os dados do primeiro usuário encontrado (deve ser único)
    return NextResponse.json(usuarios[0], { status: 200 })
  } catch (error: any) { // Adicionado ': any' para acessar 'error.message'
    console.error('Erro ao buscar usuário:', error)
    // Retorna a mensagem de erro do banco de dados para facilitar a depuração.
    // Em produção, você pode querer uma mensagem mais genérica por segurança.
    return NextResponse.json(
      { error: 'Erro ao buscar usuário', details: error.message || 'Detalhes não disponíveis' },
      { status: 500 }
    )
  }
}