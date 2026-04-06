import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

// ✅ Valores aceitos pelo banco (constraints)
const VALID_STATUS = ['Pendente', 'Em andamento', 'Aprovado', 'Reprovado', 'Bloqueado']
const VALID_TYPE = ['Funcional', 'Integração', 'Regressão', 'Smoke', 'Performance', 'Segurança']
const VALID_PRIORITY = ['Baixa', 'Média', 'Alta', 'Crítica']
const VALID_BEHAVIOR = ['Não definido', 'Positivo', 'Negativo', 'Destrutivo']
const VALID_SEVERITY = ['Bloqueador', 'Crítico', 'Maior', 'Menor', 'Trivial']
const VALID_AUTOMATION = ['Manual', 'A automatizar', 'Automatizado']

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const statusTeste = searchParams.get('status')
    const periodo = searchParams.get('periodo')

    let query = 'SELECT * FROM test_cases WHERE 1=1'
    const params: (string | null)[] = []

    if (statusTeste) {
      query += ' AND status = $' + (params.length + 1)
      params.push(statusTeste)
    }

    if (periodo) {
      const hoje = new Date()
      const dataInicio = new Date()

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
      {
        error: 'Erro ao buscar casos de teste',
        details: error instanceof Error ? error.message : String(error),
      },
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
      created_by,
    } = data

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    // ✅ Valida e aplica defaults seguros para cada campo com constraint
    const safeStatus = VALID_STATUS.includes(status) ? status : 'Pendente'
    const safeType = VALID_TYPE.includes(type) ? type : 'Funcional'
    const safePriority = VALID_PRIORITY.includes(priority) ? priority : null
    const safeBehavior = VALID_BEHAVIOR.includes(behavior) ? behavior : null
    const safeSeverity = VALID_SEVERITY.includes(severity) ? severity : null
    const safeAutomation = VALID_AUTOMATION.includes(automation_status) ? automation_status : 'Manual'

    // ✅ Converte tags para array (aceita string "tag1, tag2" ou array)
    let tagsArray: string[] = []
    if (Array.isArray(tags)) {
      tagsArray = tags.filter(Boolean)
    } else if (typeof tags === 'string' && tags.trim()) {
      tagsArray = tags.split(',').map((t: string) => t.trim()).filter(Boolean)
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
        suite_id,
        severity,
        automation_status,
        behavior,
        layer,
        milestone,
        tags,
        created_by,
        created_at,
        updated_at
      ) VALUES (
        ${title},
        ${description ?? null},
        ${safePriority},
        ${safeStatus},
        ${safeType},
        ${pre_condition ?? null},
        ${post_condition ?? null},
        ${suite_id ?? null},
        ${safeSeverity},
        ${safeAutomation},
        ${safeBehavior},
        ${layer ?? null},
        ${milestone ?? null},
        ${tagsArray},
        ${created_by ?? null},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    const testCase = resultado[0]

    // ✅ Insere steps em try/catch separado para não reverter o test case
    if (steps && Array.isArray(steps) && steps.length > 0) {
      try {
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
        console.error('Erro ao inserir steps (test case foi criado):', stepsError)
      }
    }

    return NextResponse.json(testCase, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar caso de teste:', error)
    return NextResponse.json(
      {
        error: 'Erro ao criar caso de teste',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}