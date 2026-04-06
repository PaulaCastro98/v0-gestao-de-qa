import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const users = await sql`SELECT id, email, nome FROM users WHERE ativo = true ORDER BY nome ASC`
    return NextResponse.json(users)
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
  }
}
