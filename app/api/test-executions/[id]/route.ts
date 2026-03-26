import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const data = await request.json()

    const result = await sql`
      UPDATE test_executions
      SET
        feature = ${data.feature},
        historia_git = ${data.historia_git},
        story_points = ${data.story_points},
        sprint = ${data.sprint},
        status_hu = ${data.status_hu},
        tc_id = ${data.tc_id},
        tipo_teste = ${data.tipo_teste},
        status_teste = ${data.status_teste},
        bug_id = ${data.bug_id},
        criticidade = ${data.criticidade},
        ambiente = ${data.ambiente},
        insights_qa = ${data.insights_qa},
        automacao = ${data.automacao},
        flaky = ${data.flaky},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (!result.length) {
      return NextResponse.json(
        { error: 'Execução não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Erro ao atualizar execução:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar execução' },
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
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    await sql`DELETE FROM test_executions WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar execução:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar execução' },
      { status: 500 }
    )
  }
}
