import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const columnId = request.nextUrl.searchParams.get('columnId')
    const cards = await sql`
      SELECT * FROM kanban_cards 
      WHERE column_id = ${columnId}
      ORDER BY position ASC
    `
    return NextResponse.json(cards)
  } catch (error) {
    console.error('[v0] Error fetching cards:', error)
    return NextResponse.json({ error: 'Error fetching cards' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { columnId, title, description, type, priority, position, responsaveis, prioridadeNum, sprintNum, estimativa, tipoTrabalho } = await request.json()
    const card = await sql`
      INSERT INTO kanban_cards (
        column_id, title, description, type, priority, position, 
        responsaveis, prioridade_num, sprint_num, estimativa, tipo_trabalho,
        created_at, updated_at
      )
      VALUES (
        ${columnId}, ${title}, ${description}, ${type}, ${priority}, ${position},
        ${JSON.stringify(responsaveis || [])}, ${prioridadeNum || null}, ${sprintNum || null}, 
        ${JSON.stringify(estimativa || [])}, ${tipoTrabalho || null},
        NOW(), NOW()
      )
      RETURNING *
    `
    return NextResponse.json(card[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating card:', error)
    return NextResponse.json({ error: 'Error creating card' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { cardId, title, description, columnId, position, responsaveis, prioridadeNum, sprintNum, estimativa, tipoTrabalho } = await request.json()
    const card = await sql`
      UPDATE kanban_cards 
      SET 
        title = ${title},
        description = ${description},
        column_id = ${columnId}, 
        position = ${position},
        responsaveis = ${JSON.stringify(responsaveis || [])},
        prioridade_num = ${prioridadeNum || null},
        sprint_num = ${sprintNum || null},
        estimativa = ${JSON.stringify(estimativa || [])},
        tipo_trabalho = ${tipoTrabalho || null},
        updated_at = NOW()
      WHERE id = ${cardId}
      RETURNING *
    `
    return NextResponse.json(card[0])
  } catch (error) {
    console.error('[v0] Error updating card:', error)
    return NextResponse.json({ error: 'Error updating card' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cardId = request.nextUrl.searchParams.get('cardId')
    await sql`DELETE FROM kanban_cards WHERE id = ${cardId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting card:', error)
    return NextResponse.json({ error: 'Error deleting card' }, { status: 500 })
  }
}
