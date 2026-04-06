import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const bugs = await sql`SELECT * FROM bugs ORDER BY created_at DESC`
    return NextResponse.json(bugs)
  } catch (error) {
    console.error('[v0] Error fetching bugs:', error)
    return NextResponse.json({ error: 'Erro ao buscar bugs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, severity, priority, status, sprint_release, project_id, created_by } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const bug = await sql`
      INSERT INTO bugs (title, description, severity, priority, status, sprint_release, project_id, created_by, created_at, updated_at)
      VALUES (${title}, ${description || null}, ${severity || 'Média'}, ${priority || 'Média'}, ${status || 'Aberto'}, ${sprint_release || null}, ${project_id || null}, ${created_by || null}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json(bug[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating bug:', error)
    return NextResponse.json({ error: 'Erro ao criar bug' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, severity, priority, status, sprint_release } = await request.json()

    const bug = await sql`
      UPDATE bugs 
      SET title = ${title}, description = ${description}, severity = ${severity}, priority = ${priority}, status = ${status}, sprint_release = ${sprint_release}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(bug[0])
  } catch (error) {
    console.error('[v0] Error updating bug:', error)
    return NextResponse.json({ error: 'Erro ao atualizar bug' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    await sql`DELETE FROM bugs WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting bug:', error)
    return NextResponse.json({ error: 'Erro ao excluir bug' }, { status: 500 })
  }
}
