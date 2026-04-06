import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// GET /api/test-plan-cases?planId=1 => cases linked to a plan
export async function GET(request: NextRequest) {
  try {
    const planId = request.nextUrl.searchParams.get('planId')

    if (!planId) {
      return NextResponse.json({ error: 'planId é obrigatório' }, { status: 400 })
    }

    const cases = await sql`
      SELECT 
        tc.id,
        tc.title,
        tc.priority,
        tc.status,
        tc.type,
        tc.automation_status,
        tc.suite_id,
        ts.name AS suite_name,
        tpc.id AS plan_case_id
      FROM test_plan_cases tpc
      JOIN test_cases tc ON tc.id = tpc.test_case_id
      LEFT JOIN test_suites ts ON ts.id = tc.suite_id
      WHERE tpc.test_plan_id = ${planId}
      ORDER BY ts.name ASC, tc.title ASC
    `

    return NextResponse.json(cases)
  } catch (error) {
    console.error('[v0] Error fetching plan cases:', error)
    return NextResponse.json({ error: 'Erro ao buscar casos do plano' }, { status: 500 })
  }
}

// POST /api/test-plan-cases => link cases to plan
export async function POST(request: NextRequest) {
  try {
    const { planId, caseIds } = await request.json()

    if (!planId || !Array.isArray(caseIds) || caseIds.length === 0) {
      return NextResponse.json({ error: 'planId e caseIds são obrigatórios' }, { status: 400 })
    }

    // Insert only cases not already linked
    const inserted: any[] = []
    for (const caseId of caseIds) {
      const existing = await sql`
        SELECT id FROM test_plan_cases WHERE test_plan_id = ${planId} AND test_case_id = ${caseId}
      `
      if (existing.length === 0) {
        const row = await sql`
          INSERT INTO test_plan_cases (test_plan_id, test_case_id, created_at)
          VALUES (${planId}, ${caseId}, NOW())
          RETURNING *
        `
        inserted.push(row[0])
      }
    }

    return NextResponse.json({ inserted: inserted.length }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error linking cases to plan:', error)
    return NextResponse.json({ error: 'Erro ao vincular casos ao plano' }, { status: 500 })
  }
}

// DELETE /api/test-plan-cases?planCaseId=1 => unlink a case from a plan
export async function DELETE(request: NextRequest) {
  try {
    const planCaseId = request.nextUrl.searchParams.get('planCaseId')

    if (!planCaseId) {
      return NextResponse.json({ error: 'planCaseId é obrigatório' }, { status: 400 })
    }

    await sql`DELETE FROM test_plan_cases WHERE id = ${planCaseId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error removing case from plan:', error)
    return NextResponse.json({ error: 'Erro ao remover caso do plano' }, { status: 500 })
  }
}
