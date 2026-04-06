import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const projects = await sql`SELECT * FROM projects ORDER BY created_at DESC`
    return NextResponse.json(projects)
  } catch (error) {
    console.error('[v0] Error fetching projects:', error)
    return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()
    const project = await sql`
      INSERT INTO projects (name, description, created_at, updated_at)
      VALUES (${name}, ${description}, NOW(), NOW())
      RETURNING *
    `
    return NextResponse.json(project[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating project:', error)
    return NextResponse.json({ error: 'Error creating project' }, { status: 500 })
  }
}
