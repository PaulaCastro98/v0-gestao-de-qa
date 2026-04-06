import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    const members = await sql`
      SELECT pm.*, u.email, u.nome FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ${projectId}
    `
    return NextResponse.json(members)
  } catch (error) {
    console.error('[v0] Error fetching members:', error)
    return NextResponse.json({ error: 'Error fetching members' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, userId, role } = await request.json()
    const member = await sql`
      INSERT INTO project_members (project_id, user_id, role, created_at)
      VALUES (${projectId}, ${userId}, ${role}, NOW())
      RETURNING *
    `
    return NextResponse.json(member[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error adding member:', error)
    return NextResponse.json({ error: 'Error adding member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get('memberId')
    await sql`DELETE FROM project_members WHERE id = ${memberId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error removing member:', error)
    return NextResponse.json({ error: 'Error removing member' }, { status: 500 })
  }
}
