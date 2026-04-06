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

    // Check if this is a simple suite_id update
    if ('suite_id' in data && Object.keys(data).length === 1) {
      const resultado = await sql`
        UPDATE test_cases
        SET suite_id = ${data.suite_id}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      if (!resultado.length) {
        return NextResponse.json({ error: 'Caso de teste não encontrado' }, { status: 404 })
      }
      return NextResponse.json(resultado[0])
    }

    // Full update with all fields
    const {
      title, description, priority, status, type, pre_condition, post_condition,
      suite_id, severity, automation_status, behavior, layer, milestone, tags,
      // Legacy fields for backwards compatibility
      titulo_tc, descricao_objetivo, prioridade_teste, status_teste, tipo_teste, pre_condicoes
    } = data

    const resultado = await sql`
      UPDATE test_cases
      SET
        title = COALESCE(${title}, ${titulo_tc}, title),
        description = COALESCE(${description}, ${descricao_objetivo}, description),
        priority = COALESCE(${priority}, ${prioridade_teste}, priority),
        status = COALESCE(${status}, ${status_teste}, status),
        type = COALESCE(${type}, ${tipo_teste}, type),
        pre_condition = COALESCE(${pre_condition}, ${pre_condicoes}, pre_condition),
        post_condition = COALESCE(${post_condition}, post_condition),
        suite_id = COALESCE(${suite_id}, suite_id),
        severity = COALESCE(${severity}, severity),
        automation_status = COALESCE(${automation_status}, automation_status),
        behavior = COALESCE(${behavior}, behavior),
        layer = COALESCE(${layer}, layer),
        milestone = COALESCE(${milestone}, milestone),
        tags = COALESCE(${tags}, tags),
        updated_at = NOW()
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
