import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

// ✅ Mesmos valores válidos da API principal
const VALID_STATUS = ['Pendente', 'Em andamento', 'Aprovado', 'Reprovado', 'Bloqueado']
const VALID_TYPE = ['Funcional', 'Integração', 'Regressão', 'Smoke', 'Performance', 'Segurança']
const VALID_PRIORITY = ['Baixa', 'Média', 'Alta', 'Crítica']
const VALID_BEHAVIOR = ['Não definido', 'Positivo', 'Negativo', 'Destrutivo']
const VALID_SEVERITY = ['Bloqueador', 'Crítico', 'Maior', 'Menor', 'Trivial']
const VALID_AUTOMATION = ['Manual', 'A automatizar', 'Automatizado']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ✅ Busca test case junto com seus steps
    const testCase = await sql`
      SELECT * FROM test_cases WHERE id = ${id}
    `

    if (!testCase.length) {
      return NextResponse.json(
        { error: 'Caso de teste não encontrado' },
        { status: 404 }
      )
    }

    // ✅ Busca os steps do test case
    const steps = await sql`
      SELECT * FROM test_case_steps 
      WHERE test_case_id = ${id} 
      ORDER BY step_number ASC
    `

    return NextResponse.json({ ...testCase[0], steps })
  } catch (error) {
    console.error('Erro ao buscar caso de teste:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar caso de teste',
        details: error instanceof Error ? error.message : String(error),
      },
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

    // ✅ Update simples de suite_id (drag and drop)
    if ('suite_id' in data && Object.keys(data).length === 1) {
      const resultado = await sql`
        UPDATE test_cases
        SET suite_id = ${data.suite_id}, updated_at = NOW()
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
    }

    const {
      title,
      description,
      priority,
      status,
      type,
      pre_condition,
      post_condition,
      suite_id,
      severity,
      automation_status,
      behavior,
      layer,
      milestone,
      tags,
      steps,
      expected_result,
    } = data

    // ✅ Valida constraints antes de atualizar
    const safeStatus = status && VALID_STATUS.includes(status) ? status : undefined
    const safeType = type && VALID_TYPE.includes(type) ? type : undefined
    const safePriority = priority && VALID_PRIORITY.includes(priority) ? priority : undefined
    const safeBehavior = behavior && VALID_BEHAVIOR.includes(behavior) ? behavior : undefined
    const safeSeverity = severity && VALID_SEVERITY.includes(severity) ? severity : undefined
    const safeAutomation = automation_status && VALID_AUTOMATION.includes(automation_status) ? automation_status : undefined

    // ✅ Converte tags para array
    let tagsArray: string[] | undefined = undefined
    if (Array.isArray(tags)) {
      tagsArray = tags.filter(Boolean)
    } else if (typeof tags === 'string' && tags.trim()) {
      tagsArray = tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    }

    const resultado = await sql`
      UPDATE test_cases
      SET
        title            = COALESCE(${title ?? null}, title),
        description      = COALESCE(${description ?? null}, description),
        priority         = COALESCE(${safePriority ?? null}, priority),
        status           = COALESCE(${safeStatus ?? null}, status),
        type             = COALESCE(${safeType ?? null}, type),
        pre_condition    = COALESCE(${pre_condition ?? null}, pre_condition),
        post_condition   = COALESCE(${post_condition ?? null}, post_condition),
        suite_id         = COALESCE(${suite_id ?? null}, suite_id),
        severity         = COALESCE(${safeSeverity ?? null}, severity),
        automation_status = COALESCE(${safeAutomation ?? null}, automation_status),
        behavior         = COALESCE(${safeBehavior ?? null}, behavior),
        layer            = COALESCE(${layer ?? null}, layer),
        milestone        = COALESCE(${milestone ?? null}, milestone),
        tags             = COALESCE(${tagsArray ?? null}, tags),
        updated_at       = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (!resultado.length) {
      return NextResponse.json(
        { error: 'Caso de teste não encontrado' },
        { status: 404 }
      )
    }

    const testCase = resultado[0]

    // ✅ Atualiza steps se fornecidos
    if (steps && Array.isArray(steps) && steps.length > 0) {
      try {
        // Remove steps antigos e insere os novos
        await sql`DELETE FROM test_case_steps WHERE test_case_id = ${id}`

        for (let i = 0; i < steps.length; i++) {
          const stepText = steps[i]
          if (stepText && stepText.trim()) {
            await sql`
              INSERT INTO test_case_steps (
                test_case_id,
                step_number,
                action,
                expected_result,
                created_at
              ) VALUES (
                ${testCase.id},
                ${i + 1},
                ${stepText},
                ${i === steps.length - 1 ? (expected_result ?? null) : null},
                NOW()
              )
            `
          }
        }
      } catch (stepsError) {
        console.error('Erro ao atualizar steps:', stepsError)
      }
    }

    return NextResponse.json(testCase)
  } catch (error) {
    console.error('Erro ao atualizar caso de teste:', error)
    return NextResponse.json(
      {
        error: 'Erro ao atualizar caso de teste',
        details: error instanceof Error ? error.message : String(error),
      },
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

    // ✅ Steps são deletados automaticamente pelo CASCADE
    await sql`DELETE FROM test_cases WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar caso de teste:', error)
    return NextResponse.json(
      {
        error: 'Erro ao deletar caso de teste',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}