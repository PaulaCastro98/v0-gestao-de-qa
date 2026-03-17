import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const testCase = await sql`SELECT * FROM test_cases WHERE id = ${id}`

    if (!testCase.length) {
      return NextResponse.json(
        { error: 'Caso de teste não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(testCase[0])
  } catch (error) {
    console.error('Erro ao buscar caso de teste:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar caso de teste' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      UPDATE test_cases
      SET
        titulo = ${titulo},
        descricao = ${descricao},
        modulo = ${modulo},
        sprint = ${sprint},
        prioridade = ${prioridade},
        passos = ${passos},
        resultado_esperado = ${resultado_esperado},
        resultado_atual = ${resultado_atual},
        ambiente = ${ambiente},
        status = ${status},
        analista = ${analista},
        notas = ${notas},
        data_atualizacao = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (!resultado.length) {
      return NextResponse.json(
        { error: 'Caso de teste não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(resultado[0])
  } catch (error) {
    console.error('Erro ao atualizar caso de teste:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar caso de teste' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await sql`DELETE FROM test_cases WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar caso de teste:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar caso de teste' },
      { status: 500 }
    )
  }
}
