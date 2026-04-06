import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const testPlanId = request.nextUrl.searchParams.get('testPlanId')
    
    let runs
    if (testPlanId) {
      runs = await sql`
        SELECT * FROM test_runs 
        WHERE test_plan_id = ${testPlanId}
        ORDER BY started_at DESC
      `
    } else {
      runs = await sql`SELECT * FROM test_runs ORDER BY started_at DESC`
    }
    
    return NextResponse.json(runs)
  } catch (error) {
    console.error('[v0] Error fetching test runs:', error)
    return NextResponse.json({ error: 'Error fetching test runs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, testPlanId, executedBy, status } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    
    const run = await sql`
      INSERT INTO test_runs (name, test_plan_id, executed_by, status, started_at)
      VALUES (${name}, ${testPlanId || null}, ${executedBy || null}, ${status || 'Pendente'}, NOW())
      RETURNING *
    `
    
    return NextResponse.json(run[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating test run:', error)
    return NextResponse.json({ error: 'Error creating test run' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, status, completedAt } = await request.json()
    
    const run = await sql`
      UPDATE test_runs 
      SET name = ${name}, status = ${status}, completed_at = ${completedAt || null}
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json(run[0])
  } catch (error) {
    console.error('[v0] Error updating test run:', error)
    return NextResponse.json({ error: 'Error updating test run' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }
    
    await sql`DELETE FROM test_runs WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting test run:', error)
    return NextResponse.json({ error: 'Error deleting test run' }, { status: 500 })
  }
}
