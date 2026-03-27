// app/api/test-executions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Função GET permanece inalterada

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const data = await request.json()
    const {
      feature,
      historia_git,
      story_points,
      sprint,
      status_hu,
      tc_id,
      titulo_tc,
      tipo_teste,
      status_teste,
      resultado_esperado,
      passos,
      requisitos,
      regra,
      prioridade_teste,
      criticidade_defeito,
      ambiente,
      bug_id,
      reaberto,
      problemas_historia,
      problemas_ux_ui,
      status_automacao,
      flaky,
      observacoes,
      evidencia_url,
      data_execucao,
      assigned_to,
    } = data

    // Definir os valores permitidos para ambiente e outros campos com CHECK constraints
    const allowedAmbientes = ['DEV', 'QA', 'STAGING', 'PRODUÇÃO'];
    const allowedStatusHu = ['To Do', 'In Progress', 'Done', 'Blocked'];
    const allowedTipoTeste = ['E2E', 'Unitário', 'Integração', 'Performance', 'Segurança', 'Usabilidade'];
    const allowedStatusTeste = ['Not Executed', 'Pass', 'Fail', 'Blocked'];
    const allowedPrioridadeTeste = ['Baixa', 'Média', 'Alta', 'Crítica'];
    const allowedCriticidadeDefeito = ['Crítica', 'Alta', 'Média', 'Baixa'];
    const allowedSimNao = ['Sim', 'Não'];
    const allowedStatusAutomacao = ['Não Automatizado', 'Em Progresso', 'Automatizado'];

    // Objeto para coletar detalhes de validação
    const validationDetails: { [key: string]: string } = {};
    let isValid = true;

    // --- Validação de Dados Obrigatórios e de CHECK Constraints ---

    // titulo_tc
    if (!titulo_tc || typeof titulo_tc !== 'string' || titulo_tc.trim() === '') {
      validationDetails.titulo_tc = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.titulo_tc = 'OK';
    }

    // story_points
    if (story_points === undefined || story_points === null || typeof story_points !== 'number' || story_points < 0) {
      validationDetails.story_points = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.story_points = 'OK';
    }

    // status_hu
    if (!status_hu || !allowedStatusHu.includes(status_hu)) {
      validationDetails.status_hu = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.status_hu = 'OK';
    }

    // tipo_teste
    if (!tipo_teste || !allowedTipoTeste.includes(tipo_teste)) {
      validationDetails.tipo_teste = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.tipo_teste = 'OK';
    }

    // status_teste
    if (!status_teste || !allowedStatusTeste.includes(status_teste)) {
      validationDetails.status_teste = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.status_teste = 'OK';
    }

    // prioridade_teste
    if (!prioridade_teste || !allowedPrioridadeTeste.includes(prioridade_teste)) {
      validationDetails.prioridade_teste = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.prioridade_teste = 'OK';
    }

    // ambiente
    if (!ambiente || !allowedAmbientes.includes(ambiente)) {
      validationDetails.ambiente = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.ambiente = 'OK';
    }

    // reaberto (espera 'Sim' ou 'Não')
    if (!reaberto || !allowedSimNao.includes(reaberto)) {
      validationDetails.reaberto = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.reaberto = 'OK';
    }

    // status_automacao
    if (!status_automacao || !allowedStatusAutomacao.includes(status_automacao)) {
      validationDetails.status_automacao = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.status_automacao = 'OK';
    }

    // flaky (espera 'Sim' ou 'Não')
    if (!flaky || !allowedSimNao.includes(flaky)) {
      validationDetails.flaky = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.flaky = 'OK';
    }

    // criticidade_defeito (opcional, mas se presente, deve ser válido)
    if (criticidade_defeito && !allowedCriticidadeDefeito.includes(criticidade_defeito)) {
      validationDetails.criticidade_defeito = 'Inválido';
      isValid = false;
    } else {
      validationDetails.criticidade_defeito = 'OK';
    }

    // Se alguma validação falhou, retorna 400
    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios faltando ou inválidos.',
          details: validationDetails,
        },
        { status: 400 }
      );
    }

    // Sanitização e padronização de valores para o banco de dados
    const sanitizedData = {
      feature: feature || null,
      historia_git: historia_git || null,
      story_points: Number(story_points), // Garante que é um número
      sprint: sprint || null,
      status_hu: status_hu,
      tc_id: tc_id || null,
      titulo_tc: titulo_tc,
      tipo_teste: tipo_teste,
      status_teste: status_teste,
      prioridade_teste: prioridade_teste,
      criticidade_defeito: criticidade_defeito || null,
      ambiente: ambiente,
      bug_id: bug_id || null,
      observacoes: observacoes || null,
      reaberto: reaberto,
      status_automacao: status_automacao,
      flaky: flaky,
    }

    // ADICIONE ESTE CONSOLE.LOG AQUI NO BACKEND
    console.log('Sanitized Data antes da inserção (ambiente):', sanitizedData.ambiente);

    // Inserção no banco de dados
    const result = await sql`
      INSERT INTO test_executions (
        feature, historia_git, story_points, sprint, status_hu, tc_id, titulo_tc,
        tipo_teste, status_teste, resultado_esperado, passos, requisitos, regra,
        prioridade_teste, criticidade_defeito, ambiente, bug_id, reaberto,
        problemas_historia, problemas_ux_ui, status_automacao, flaky,
        observacoes, evidencia_url, data_execucao, assigned_to,
        created_at, updated_at
      )
      VALUES (
        ${feature || null}, ${historia_git || null}, ${story_points || 1}, ${sprint || null}, 
        ${status_hu || 'To Do'}, ${tc_id || null}, ${titulo_tc},
        ${tipo_teste || 'E2E'}, ${status_teste || 'Not Executed'}, ${resultado_esperado || null}, 
        ${passos || null}, ${requisitos || null}, ${regra || null},
        ${prioridade_teste || 'Média'}, ${criticidade_defeito || null}, ${ambiente || 'Dev'}, 
        ${bug_id || null}, ${reaberto || 'Não'},
        ${problemas_historia || null}, ${problemas_ux_ui || null}, 
        ${status_automacao || 'Não Automatizado'}, ${flaky || 'Não'},
        ${observacoes || null}, ${evidencia_url || null}, ${data_execucao || null}, ${assigned_to || null},
        NOW(), NOW()
      )
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar execução:', error)
    return NextResponse.json(
      { error: 'Erro ao criar execução', details: error.message || 'Detalhes não disponíveis' },
      { status: 500 }
    )
  }
}