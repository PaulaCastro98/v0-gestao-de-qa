import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const metrics = await sql`
      SELECT
        sprint,
        COUNT(*) as total_casos,
        COUNT(CASE WHEN status = 'Aprovado' THEN 1 END) as casos_aprovados,
        COUNT(CASE WHEN status = 'Reprovado' THEN 1 END) as casos_reprovados,
        COUNT(CASE WHEN status = 'Em Andamento' THEN 1 END) as em_andamento,
        ROUND(
          COUNT(CASE WHEN status = 'Aprovado' THEN 1 END)::numeric / COUNT(*) * 100, 2
        ) as taxa_aprovacao,
        COUNT(CASE WHEN prioridade = 'Crítica' THEN 1 END) as defeitos_criticos,
        COUNT(CASE WHEN prioridade = 'Alta' THEN 1 END) as defeitos_altos
      FROM test_cases
      WHERE data_criacao >= NOW() - INTERVAL '90 days'
      GROUP BY sprint
      ORDER BY sprint DESC
    `

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    )
  }
}
