import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

const VALID_SEVERITY = ['Blocker', 'Critical', 'Major', 'Minor', 'Trivial']
const VALID_PRIORITY = ['Alta', 'Media', 'Baixa']
const VALID_STATUS = ['Aberto', 'Em Andamento', 'Resolvido', 'Fechado', 'Reaberto']

export async function GET(request: NextRequest) {
  try {
    const bugs = await sql`SELECT * FROM bugs ORDER BY created_at DESC`
    return NextResponse.json(bugs)
  } catch (error) {
    console.error('Erro ao buscar bugs:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar bugs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title, description, severity, priority, status, sprint_release,
      feature_story, suite_id, steps, expected_result, actual_result,
      comments, adjustment, project_id, created_by
    } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    // ✅ Mapeia valores do frontend para os valores do banco
    const severityMap: Record<string, string> = {
      'Bloqueador': 'Blocker',
      'Crítico': 'Critical',
      'Maior': 'Major',
      'Média': 'Major',   // ✅ fallback
      'Menor': 'Minor',
      'Trivial': 'Trivial',
    }

    const priorityMap: Record<string, string> = {
      'Alta': 'Alta',
      'Média': 'Media',       // ✅ sem acento no banco
      'Baixa': 'Baixa',
      'Crítica': 'Alta',        // ✅ fallback
    }

    const statusMap: Record<string, string> = {
      'Aberto': 'Aberto',
      'Em andamento': 'Em Andamento',
      'Em Andamento': 'Em Andamento',
      'Resolvido': 'Resolvido',
      'Fechado': 'Fechado',
      'Reaberto': 'Reaberto',
    }

    const finalSeverity = severityMap[severity] ?? 'Major'
    const finalPriority = priorityMap[priority] ?? 'Media'
    const finalStatus = statusMap[status] ?? 'Aberto'

    // ✅ Converte array de steps para string
    const finalSteps = Array.isArray(steps)
      ? steps.filter(Boolean).join('\n')
      : steps?.trim() || null

    const bug = await sql`
      INSERT INTO bugs (
        title, description, severity, priority, status, sprint_release,
        feature_story, suite_id, steps, expected_result, actual_result,
        comments, adjustment, project_id, created_by, created_at, updated_at
      )
      VALUES (
        ${title.trim()},
        ${description?.trim() || null},
        ${finalSeverity},
        ${finalPriority},
        ${finalStatus},
        ${sprint_release || null},
        ${feature_story?.trim() || null},
        ${suite_id ? Number(suite_id) : null},
        ${finalSteps},
        ${expected_result?.trim() || null},
        ${actual_result?.trim() || null},
        ${comments?.trim() || null},
        ${adjustment?.trim() || null},
        ${project_id ? Number(project_id) : null},
        ${created_by ? Number(created_by) : null},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    return NextResponse.json(bug[0], { status: 201 })

  } catch (error) {
    console.error('Erro ao criar bug:', error)
    return NextResponse.json(
      { error: 'Erro ao criar bug', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, severity, priority, status, sprint_release,
      feature_story, suite_id, steps, expected_result, actual_result,
      comments, adjustment } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const severityMap: Record<string, string> = {
      'Bloqueador': 'Blocker',
      'Crítico': 'Critical',
      'Maior': 'Major',
      'Média': 'Major',
      'Menor': 'Minor',
      'Trivial': 'Trivial',
    }

    const priorityMap: Record<string, string> = {
      'Alta': 'Alta',
      'Média': 'Media',
      'Baixa': 'Baixa',
      'Crítica': 'Alta',
    }

    const statusMap: Record<string, string> = {
      'Aberto': 'Aberto',
      'Em andamento': 'Em Andamento',
      'Em Andamento': 'Em Andamento',
      'Resolvido': 'Resolvido',
      'Fechado': 'Fechado',
      'Reaberto': 'Reaberto',
    }

    const finalSeverity = severityMap[severity] ?? 'Major'
    const finalPriority = priorityMap[priority] ?? 'Media'
    const finalStatus = statusMap[status] ?? 'Aberto'

    // ✅ Converte array de steps para string
    const finalSteps = Array.isArray(steps)
      ? steps.filter(Boolean).join('\n')
      : steps?.trim() || null

    const bug = await sql`
      UPDATE bugs SET
        title           = ${title.trim()},
        description     = ${description?.trim() || null},
        severity        = ${finalSeverity},
        priority        = ${finalPriority},
        status          = ${finalStatus},
        sprint_release  = ${sprint_release || null},
        feature_story   = ${feature_story?.trim() || null},
        suite_id        = ${suite_id ? Number(suite_id) : null},
        steps           = ${finalSteps},
        expected_result = ${expected_result?.trim() || null},
        actual_result   = ${actual_result?.trim() || null},
        comments        = ${comments?.trim() || null},
        adjustment      = ${adjustment?.trim() || null},
        updated_at      = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `

    if (!bug.length) {
      return NextResponse.json({ error: 'Bug não encontrado' }, { status: 404 })
    }

    return NextResponse.json(bug[0])
  } catch (error) {
    console.error('Erro ao atualizar bug:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar bug', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    await sql`DELETE FROM bugs WHERE id = ${Number(id)}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir bug:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir bug', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}