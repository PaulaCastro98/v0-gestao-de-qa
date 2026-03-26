import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sprint = searchParams.get('sprint')
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    let query = 'SELECT * FROM test_executions WHERE 1=1'
    const params: string[] = []

    if (sprint) {
      query += ' AND sprint = $' + (params.length + 1)
      params.push(sprint)
    }

    query += ' ORDER BY created_at DESC'
    const result = await sql(query, params)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao buscar execuções:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar execuções' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const data = await request.json()
    const {
      feature,
      historia_git,
      story_points,
      sprint,
      status_hu,
      tc_id,
      tipo_teste,
      status_teste,
      bug_id,
      criticidade,
      ambiente,
      insights_qa,
      automacao,
      flaky,
    } = data

    const result = await sql`
      INSERT INTO test_executions (
        feature, historia_git, story_points, sprint, status_hu, tc_id,
        tipo_teste, status_teste, bug_id, criticidade, ambiente,
        insights_qa, automacao, flaky, created_at, updated_at
      )
      VALUES (
        ${feature}, ${historia_git}, ${story_points}, ${sprint}, ${status_hu}, ${tc_id},
        ${tipo_teste}, ${status_teste}, ${bug_id}, ${criticidade}, ${ambiente},
        ${insights_qa}, ${automacao}, ${flaky}, NOW(), NOW()
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Erro ao criar execução:', error)
    return NextResponse.json(
      { error: 'Erro ao criar execução' },
      { status: 500 }
    )
  }
}
