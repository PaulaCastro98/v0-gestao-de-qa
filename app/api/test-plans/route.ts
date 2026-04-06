import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    
    let plans
    if (projectId) {
      plans = await sql`
        SELECT * FROM test_plans 
        WHERE project_id = ${projectId}
        ORDER BY created_at DESC
      `
    } else {
      plans = await sql`SELECT * FROM test_plans ORDER BY created_at DESC`
    }
    
    return NextResponse.json(plans)
  } catch (error) {
    console.error('[v0] Error fetching test plans:', error)
    return NextResponse.json({ error: 'Error fetching test plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, projectId, createdBy } = await request.json()
    
    if (!title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }
    
    const plan = await sql`
      INSERT INTO test_plans (title, description, project_id, created_by, created_at, updated_at)
      VALUES (${title}, ${description || null}, ${projectId || null}, ${createdBy || null}, NOW(), NOW())
      RETURNING *
    `
    
    return NextResponse.json(plan[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating test plan:', error)
    return NextResponse.json({ error: 'Error creating test plan' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, description } = await request.json()
    
    const plan = await sql`
      UPDATE test_plans 
      SET title = ${title}, description = ${description}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json(plan[0])
  } catch (error) {
    console.error('[v0] Error updating test plan:', error)
    return NextResponse.json({ error: 'Error updating test plan' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }
    
    await sql`DELETE FROM test_plans WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting test plan:', error)
    return NextResponse.json({ error: 'Error deleting test plan' }, { status: 500 })
  }
}
