import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    const columns = await sql`
      SELECT * FROM kanban_columns 
      WHERE project_id = ${projectId}
      ORDER BY position ASC
    `
    return NextResponse.json(columns)
  } catch (error) {
    console.error('[v0] Error fetching columns:', error)
    return NextResponse.json({ error: 'Error fetching columns' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, name, position } = await request.json()
    const column = await sql`
      INSERT INTO kanban_columns (project_id, name, position, created_at)
      VALUES (${projectId}, ${name}, ${position}, NOW())
      RETURNING *
    `
    return NextResponse.json(column[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating column:', error)
    return NextResponse.json({ error: 'Error creating column' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { columnId, name, position } = await request.json()
    const column = await sql`
      UPDATE kanban_columns 
      SET name = ${name}, position = ${position}
      WHERE id = ${columnId}
      RETURNING *
    `
    return NextResponse.json(column[0])
  } catch (error) {
    console.error('[v0] Error updating column:', error)
    return NextResponse.json({ error: 'Error updating column' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const columnId = request.nextUrl.searchParams.get('columnId')
    await sql`DELETE FROM kanban_columns WHERE id = ${columnId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting column:', error)
    return NextResponse.json({ error: 'Error deleting column' }, { status: 500 })
  }
}
