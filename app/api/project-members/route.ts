import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

const ROLES = ['DEV', 'PO', 'QA', 'UX', 'Scrum']

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId')
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }
    
    const members = await sql`
      SELECT id, project_id, nome, role, avatar_initials, created_at 
      FROM project_members 
      WHERE project_id = ${projectId}
      ORDER BY nome ASC
    `
    return NextResponse.json(members)
  } catch (error) {
    console.error('[v0] Error fetching members:', error)
    return NextResponse.json({ error: 'Error fetching members' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, nome, role } = await request.json()
    
    if (!projectId || !nome || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (!ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    
    // Gera iniciais do nome para avatar
    const initials = nome
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
    
    const member = await sql`
      INSERT INTO project_members (project_id, nome, role, avatar_initials, created_at)
      VALUES (${projectId}, ${nome}, ${role}, ${initials}, NOW())
      RETURNING *
    `
    return NextResponse.json(member[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating member:', error)
    return NextResponse.json({ error: 'Error creating member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get('memberId')
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }
    
    await sql`DELETE FROM project_members WHERE id = ${memberId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting member:', error)
    return NextResponse.json({ error: 'Error deleting member' }, { status: 500 })
  }
}
