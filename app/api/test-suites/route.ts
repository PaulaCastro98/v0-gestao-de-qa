import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    
    let suites
    if (projectId) {
      suites = await sql`
        SELECT * FROM test_suites 
        WHERE project_id = ${projectId}
        ORDER BY created_at DESC
      `
    } else {
      suites = await sql`SELECT * FROM test_suites ORDER BY created_at DESC`
    }
    
    return NextResponse.json(suites)
  } catch (error) {
    console.error('[v0] Error fetching test suites:', error)
    return NextResponse.json({ error: 'Error fetching test suites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, projectId, preCondition, createdBy } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    
    const suite = await sql`
      INSERT INTO test_suites (name, description, project_id, pre_condition, created_by, created_at, updated_at)
      VALUES (${name}, ${description || null}, ${projectId || null}, ${preCondition || null}, ${createdBy || null}, NOW(), NOW())
      RETURNING *
    `
    
    return NextResponse.json(suite[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating test suite:', error)
    return NextResponse.json({ error: 'Error creating test suite' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, preCondition } = await request.json()
    
    const suite = await sql`
      UPDATE test_suites 
      SET name = ${name}, description = ${description}, pre_condition = ${preCondition}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    return NextResponse.json(suite[0])
  } catch (error) {
    console.error('[v0] Error updating test suite:', error)
    return NextResponse.json({ error: 'Error updating test suite' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }
    
    await sql`DELETE FROM test_suites WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting test suite:', error)
    return NextResponse.json({ error: 'Error deleting test suite' }, { status: 500 })
  }
}
