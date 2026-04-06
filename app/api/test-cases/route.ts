import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sprint = searchParams.get('sprint')
    const statusTeste = searchParams.get('status')
    const periodo = searchParams.get('periodo')

    let query = 'SELECT * FROM test_cases WHERE 1=1'
    const params: (string | null)[] = []

    if (sprint) {
      query += ' AND sprint = $' + (params.length + 1)
      params.push(sprint)
    }

    if (statusTeste) {
      query += ' AND status_teste = $' + (params.length + 1)
      params.push(statusTeste)
    }

    if (periodo) {
      const hoje = new Date()
      let dataInicio = new Date()

      if (periodo === '7dias') {
        dataInicio.setDate(hoje.getDate() - 7)
      } else if (periodo === '30dias') {
        dataInicio.setDate(hoje.getDate() - 30)
      } else if (periodo === '90dias') {
        dataInicio.setDate(hoje.getDate() - 90)
      }

      query += ' AND created_at >= $' + (params.length + 1)
      params.push(dataInicio.toISOString())
    }

    query += ' ORDER BY created_at DESC'

    const testCases = await sql(query, params)
    return NextResponse.json(testCases)
  } catch (error) {
    console.error('Erro ao buscar casos de teste:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar casos de teste' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      title,
      description,
      priority,
      status,
      type,
      pre_condition,
      post_condition,
      steps,
      expected_result,
      suite_id,
      severity,
      automation_status,
      behavior,
      layer,
      milestone,
      tags,
      project_id,
      created_by,
    } = data

    if (!title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const resultado = await sql`
      INSERT INTO test_cases (
        title,
        description,
        priority,
        status,
        type,
        pre_condition,
        post_condition,
        steps,
        expected_result,
        suite_id,
        severity,
        automation_status,
        behavior,
        layer,
        milestone,
        tags,
        project_id,
        created_by,
        created_at,
        updated_at
      ) VALUES (
        ${title},
        ${description || null},
        ${priority || 'Média'},
        ${status || 'Não Iniciado'},
        ${type || 'Funcional'},
        ${pre_condition || null},
        ${post_condition || null},
        ${steps || null},
        ${expected_result || null},
        ${suite_id || null},
        ${severity || null},
        ${automation_status || 'Manual'},
        ${behavior || null},
        ${layer || null},
        ${milestone || null},
        ${tags || null},
        ${project_id || null},
        ${created_by || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    return NextResponse.json(resultado[0], { status: 201 })
  } catch (error) {
    console.error('Erro ao criar caso de teste:', error)
    return NextResponse.json(
      { error: 'Erro ao criar caso de teste' },
      { status: 500 }
    )
  }
}
