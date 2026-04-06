import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM projects WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting project:', error)
    return NextResponse.json({ error: 'Error deleting project' }, { status: 500 })
  }
}
