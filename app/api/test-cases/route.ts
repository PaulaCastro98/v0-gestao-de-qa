import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sprint = searchParams.get('sprint')
    const status = searchParams.get('status')
    const periodo = searchParams.get('periodo')

    let query = 'SELECT * FROM test_cases WHERE 1=1'
    const params: (string | null)[] = []

    if (sprint) {
      query += ' AND sprint = $' + (params.length + 1)
      params.push(sprint)
    }

    if (status) {
      query += ' AND status = $' + (params.length + 1)
      params.push(status)
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

      query += ' AND data_criacao >= $' + (params.length + 1)
      params.push(dataInicio.toISOString())
    }

    query += ' ORDER BY data_criacao DESC'

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
      titulo,
      descricao,
      modulo,
      sprint,
      prioridade,
      passos,
      resultado_esperado,
      resultado_atual,
      ambiente,
      status,
      analista,
      notas,
    } = data

    const resultado = await sql`
      INSERT INTO test_cases (
        titulo,
        descricao,
        modulo,
        sprint,
        prioridade,
        passos,
        resultado_esperado,
        resultado_atual,
        ambiente,
        status,
        analista,
        notas,
        data_criacao,
        data_atualizacao
      ) VALUES (
        ${titulo},
        ${descricao},
        ${modulo},
        ${sprint},
        ${prioridade},
        ${passos},
        ${resultado_esperado},
        ${resultado_atual},
        ${ambiente},
        ${status},
        ${analista},
        ${notas},
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
