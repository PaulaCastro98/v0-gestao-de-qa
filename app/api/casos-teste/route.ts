import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const historia_id = searchParams.get('historia_id')
    const status_teste = searchParams.get('status_teste')

    let query = 'SELECT * FROM casos_teste WHERE 1=1'
    const params: (string | number)[] = []

    if (historia_id) {
      query += ' AND historia_id = $' + (params.length + 1)
      params.push(parseInt(historia_id))
    }

    if (status_teste) {
      query += ' AND status_teste = $' + (params.length + 1)
      params.push(status_teste)
    }

    query += ' ORDER BY created_at DESC'
    const casos = await sql(query, params)
    return NextResponse.json(casos)
  } catch (error) {
    console.error('Erro ao buscar casos de teste:', error)
    return NextResponse.json({ error: 'Erro ao buscar casos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      historia_id,
      tc_id,
      titulo,
      passos,
      requisitos,
      regra,
      resultado_esperado,
      status_hu,
      tipo_teste,
      prioridade_teste,
      criticidade_defeito,
      problema_historia_requisito,
      problema_ux_ui,
      status_automacao,
      observacoes_adicionais,
      status_teste,
      data_execucao,
      created_by,
    } = data

    const caso = await sql`
      INSERT INTO casos_teste (
        historia_id, tc_id, titulo, passos, requisitos, regra, resultado_esperado,
        status_hu, tipo_teste, prioridade_teste, criticidade_defeito,
        problema_historia_requisito, problema_ux_ui, status_automacao,
        observacoes_adicionais, status_teste, data_execucao, created_by
      )
      VALUES (
        ${historia_id}, ${tc_id}, ${titulo}, ${passos}, ${requisitos}, ${regra}, ${resultado_esperado},
        ${status_hu}, ${tipo_teste}, ${prioridade_teste}, ${criticidade_defeito},
        ${problema_historia_requisito}, ${problema_ux_ui}, ${status_automacao},
        ${observacoes_adicionais}, ${status_teste}, ${data_execucao}, ${created_by}
      )
      RETURNING *
    `

    return NextResponse.json(caso[0], { status: 201 })
  } catch (error) {
    console.error('Erro ao criar caso de teste:', error)
    return NextResponse.json({ error: 'Erro ao criar caso' }, { status: 500 })
  }
}
