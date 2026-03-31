import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const caso_teste_id = searchParams.get('caso_teste_id')

    let query = 'SELECT * FROM bugs WHERE 1=1'
    const params: (string | number)[] = []

    if (caso_teste_id) {
      query += ' AND caso_teste_id = $' + (params.length + 1)
      params.push(parseInt(caso_teste_id))
    }

    query += ' ORDER BY created_at DESC'
    const bugs = await sql(query, params)
    return NextResponse.json(bugs)
  } catch (error) {
    console.error('Erro ao buscar bugs:', error)
    return NextResponse.json({ error: 'Erro ao buscar bugs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { caso_teste_id, tarefa_bug, descricao, sprint, data_execucao, status, created_by } = await request.json()

    const bug = await sql`
      INSERT INTO bugs (caso_teste_id, tarefa_bug, descricao, sprint, data_execucao, status, created_by)
      VALUES (${caso_teste_id}, ${tarefa_bug}, ${descricao}, ${sprint}, ${data_execucao}, ${status}, ${created_by})
      RETURNING *
    `

    return NextResponse.json(bug[0], { status: 201 })
  } catch (error) {
    console.error('Erro ao criar bug:', error)
    return NextResponse.json({ error: 'Erro ao criar bug' }, { status: 500 })
  }
}
