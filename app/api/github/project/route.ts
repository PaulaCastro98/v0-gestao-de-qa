import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'GITHUB_TOKEN não configurado' }, { status: 500 })
  }

  const query = `
    query {
      organization(login: "viadupladigital") {
        projectV2(number: 1) {
          title
          items(first: 100) {
            nodes {
              id
              fieldValues(first: 20) {
                nodes {
                  ... on ProjectV2ItemFieldTextValue {
                    text
                    field { ... on ProjectV2Field { name } }
                  }
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field { ... on ProjectV2SingleSelectField { name } }
                  }
                  ... on ProjectV2ItemFieldNumberValue {
                    number
                    field { ... on ProjectV2Field { name } }
                  }
                  ... on ProjectV2ItemFieldIterationValue {
                    title
                    field { ... on ProjectV2IterationField { name } }
                  }
                  ... on ProjectV2ItemFieldUserValue {
                    users(first: 10) {
                      nodes { login name }
                    }
                    field { ... on ProjectV2Field { name } }
                  }
                }
              }
              content {
                ... on Issue {
                  title
                  body
                  number
                  labels(first: 10) {
                    nodes { name }
                  }
                  assignees(first: 10) {
                    nodes { login name }
                  }
                }
                ... on DraftIssue {
                  title
                  body
                }
                ... on PullRequest {
                  title
                  body
                  number
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[v0] GitHub API error:', errorText)
      return NextResponse.json({ error: 'Erro na API do GitHub' }, { status: res.status })
    }

    const data = await res.json()

    if (data.errors) {
      console.error('[v0] GitHub GraphQL errors:', data.errors)
      return NextResponse.json({ error: data.errors[0]?.message || 'Erro GraphQL' }, { status: 400 })
    }

    const project = data.data?.organization?.projectV2
    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    // Parse items into cards
    const cards = project.items.nodes.map((item: any) => {
      const content = item.content || {}
      const fieldValues = item.fieldValues?.nodes || []

      // Extract field values
      let status = 'Todo'
      let type = 'Tarefa'
      let assignees: string[] = []

      fieldValues.forEach((fv: any) => {
        const fieldName = fv.field?.name?.toLowerCase()
        if (fieldName === 'status' && fv.name) {
          status = fv.name
        }
        if (fieldName === 'type' || fieldName === 'tipo') {
          type = fv.name || fv.text || type
        }
        if (fv.users?.nodes) {
          assignees = fv.users.nodes.map((u: any) => u.name || u.login)
        }
      })

      // Get assignees from content if not in field values
      if (assignees.length === 0 && content.assignees?.nodes) {
        assignees = content.assignees.nodes.map((a: any) => a.name || a.login)
      }

      // Detect type from labels
      if (content.labels?.nodes) {
        const labels = content.labels.nodes.map((l: any) => l.name.toLowerCase())
        if (labels.includes('bug')) type = 'Bug'
        else if (labels.includes('feature')) type = 'Feature'
        else if (labels.includes('epic') || labels.includes('epico')) type = 'Epico'
        else if (labels.includes('story') || labels.includes('historia')) type = 'Historia'
      }

      return {
        githubId: item.id,
        title: content.title || 'Sem título',
        description: content.body || '',
        status,
        type,
        responsaveis: assignees,
      }
    })

    return NextResponse.json({ projectTitle: project.title, cards })
  } catch (error) {
    console.error('[v0] Error fetching GitHub project:', error)
    return NextResponse.json({ error: 'Erro ao buscar projeto do GitHub' }, { status: 500 })
  }
}
