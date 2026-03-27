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
      titulo_tc,
      tipo_teste,
      status_teste,
      resultado_esperado,
      passos,
      requisitos,
      regra,
      prioridade_teste,
      criticidade_defeito,
      ambiente,
      bug_id,
      reaberto,
      problemas_historia,
      problemas_ux_ui,
      status_automacao,
      flaky,
      observacoes,
      evidencia_url,
      data_execucao,
      assigned_to,
    } = data

    const result = await sql`
      INSERT INTO test_executions (
        feature, historia_git, story_points, sprint, status_hu, tc_id, titulo_tc,
        tipo_teste, status_teste, resultado_esperado, passos, requisitos, regra,
        prioridade_teste, criticidade_defeito, ambiente, bug_id, reaberto,
        problemas_historia, problemas_ux_ui, status_automacao, flaky,
        observacoes, evidencia_url, data_execucao, assigned_to,
        created_at, updated_at
      )
      VALUES (
        ${feature || null}, ${historia_git || null}, ${story_points || 1}, ${sprint || null}, 
        ${status_hu || 'To Do'}, ${tc_id || null}, ${titulo_tc},
        ${tipo_teste || 'E2E'}, ${status_teste || 'Not Executed'}, ${resultado_esperado || null}, 
        ${passos || null}, ${requisitos || null}, ${regra || null},
        ${prioridade_teste || 'Média'}, ${criticidade_defeito || null}, ${ambiente || 'Dev'}, 
        ${bug_id || null}, ${reaberto || 'Não'},
        ${problemas_historia || null}, ${problemas_ux_ui || null}, 
        ${status_automacao || 'Não Automatizado'}, ${flaky || 'Não'},
        ${observacoes || null}, ${evidencia_url || null}, ${data_execucao || null}, ${assigned_to || null},
        NOW(), NOW()
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
