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
        feature = ${data.feature || null},
        historia_git = ${data.historia_git || null},
        story_points = ${data.story_points || 1},
        sprint = ${data.sprint || null},
        status_hu = ${data.status_hu || 'To Do'},
        tc_id = ${data.tc_id || null},
        titulo_tc = ${data.titulo_tc},
        tipo_teste = ${data.tipo_teste || 'E2E'},
        status_teste = ${data.status_teste || 'Not Executed'},
        resultado_esperado = ${data.resultado_esperado || null},
        passos = ${data.passos || null},
        requisitos = ${data.requisitos || null},
        regra = ${data.regra || null},
        prioridade_teste = ${data.prioridade_teste || 'Média'},
        criticidade_defeito = ${data.criticidade_defeito || null},
        ambiente = ${data.ambiente || 'Dev'},
        bug_id = ${data.bug_id || null},
        reaberto = ${data.reaberto || 'Não'},
        problemas_historia = ${data.problemas_historia || null},
        problemas_ux_ui = ${data.problemas_ux_ui || null},
        status_automacao = ${data.status_automacao || 'Não Automatizado'},
        flaky = ${data.flaky || 'Não'},
        observacoes = ${data.observacoes || null},
        evidencia_url = ${data.evidencia_url || null},
        assigned_to = ${data.assigned_to || null},
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
