import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bug_id = formData.get('bug_id') as string

    if (!file || !bug_id) {
      return NextResponse.json({ error: 'Arquivo e bug_id são obrigatórios' }, { status: 400 })
    }

    // Upload para Vercel Blob (privado)
    const blob = await put(file.name, file, {
      access: 'private',
    })

    // Salvar referência no banco
    const evidencia = await sql`
      INSERT INTO evidencias (bug_id, nome_arquivo, url, pathname, tipo, tamanho)
      VALUES (${parseInt(bug_id)}, ${file.name}, ${blob.url}, ${blob.pathname}, ${file.type}, ${file.size})
      RETURNING *
    `

    return NextResponse.json(evidencia[0], { status: 201 })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
