import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sprint = searchParams.get('sprint')

    let query = 'SELECT * FROM historias WHERE 1=1'
    const params: string[] = []

    if (sprint) {
      query += ' AND sprint = $' + (params.length + 1)
      params.push(sprint)
    }

    query += ' ORDER BY created_at DESC'
    const historias = await sql(query, params)
    return NextResponse.json(historias)
  } catch (error) {
    console.error('Erro ao buscar historias:', error)
    return NextResponse.json({ error: 'Erro ao buscar historias' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome_feature, titulo_historia, descricao_historia, link_historia, status, sprint, created_by } = await request.json()

    const historia = await sql`
      INSERT INTO historias (nome_feature, titulo_historia, descricao_historia, link_historia, status, sprint, created_by)
      VALUES (${nome_feature}, ${titulo_historia}, ${descricao_historia}, ${link_historia}, ${status}, ${sprint}, ${created_by})
      RETURNING *
    `

    return NextResponse.json(historia[0], { status: 201 })
  } catch (error) {
    console.error('Erro ao criar historia:', error)
    return NextResponse.json({ error: 'Erro ao criar historia' }, { status: 500 })
  }
}
