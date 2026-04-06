import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const cards = await sql`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.column_id,
        col.name as column_name
      FROM kanban_cards c
      LEFT JOIN kanban_columns col ON c.column_id = col.id
      ORDER BY c.title ASC
    `
    return NextResponse.json(cards)
  } catch (error) {
    console.error('[v0] Error fetching all kanban cards:', error)
    return NextResponse.json({ error: 'Erro ao buscar cards' }, { status: 500 })
  }
}
