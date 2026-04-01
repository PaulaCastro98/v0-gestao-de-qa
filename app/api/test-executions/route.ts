// app/api/test-executions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Função GET permanece inalterada (assumindo que está correta)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const result = await sql`SELECT * FROM test_executions WHERE id = ${id}`;
      if (result.length === 0) {
        return NextResponse.json({ error: 'Execução de teste não encontrada' }, { status: 404 });
      }
      return NextResponse.json(result[0], { status: 200 });
    } else {
      const result = await sql`SELECT * FROM test_executions ORDER BY created_at DESC`;
      return NextResponse.json(result, { status: 200 });
    }
  } catch (error: any) {
    console.error('Erro ao buscar execuções:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar execuções', details: error.message || 'Detalhes não disponíveis' },
      { status: 500 }
    );
  }
}


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
    const allowedAmbientes = ['Dev', 'QA', 'Staging', 'Produção'];
    const allowedStatusHu = ['To Do', 'In Progress', 'Done', 'Blocked'];
    // AJUSTADO: Alinhado com a CHECK CONSTRAINT do banco de dados
    const allowedTipoTeste = ['Unit', 'Integration', 'E2E', 'Smoke', 'Regression', 'Exploratory'];
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
    if (typeof story_points !== 'number' || story_points < 1) {
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
    // A validação agora usa a lista 'allowedTipoTeste' corrigida
    if (!tipo_teste || !allowedTipoTeste.includes(tipo_teste)) {
      validationDetails.tipo_teste = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.tipo_teste = 'OK';
    }

    // status_teste
    // A validação agora usa a lista 'allowedStatusTeste' corrigida (que já estava certa)
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

    // reaberto
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

    // flaky
    if (!flaky || !allowedSimNao.includes(flaky)) {
      validationDetails.flaky = 'Faltando ou inválido';
      isValid = false;
    } else {
      validationDetails.flaky = 'OK';
    }

    // ambiente
    // A validação permite null/undefined/'' e verifica se o valor existe na lista
    if (ambiente !== null && ambiente !== undefined && ambiente !== '' && !allowedAmbientes.includes(ambiente)) {
      validationDetails.ambiente = 'Inválido';
      isValid = false;
    } else {
      validationDetails.ambiente = 'OK';
    }

    // criticidade_defeito
    // A validação permite null/undefined/'' e verifica se o valor existe na lista
    if (criticidade_defeito !== null && criticidade_defeito !== undefined && criticidade_defeito !== '' && !allowedCriticidadeDefeito.includes(criticidade_defeito)) {
      validationDetails.criticidade_defeito = 'Inválido';
      isValid = false;
    } else {
      validationDetails.criticidade_defeito = 'OK';
    }

    // Se alguma validação falhou, retorna o erro
    if (!isValid) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando ou inválidos.', details: validationDetails },
        { status: 400 }
      );
    }

    // --- Sanitização de Dados (Aplicar valores padrão para null/undefined/'' antes da inserção) ---
    const sanitizedData = {
      feature: feature || null,
      historia_git: historia_git || null,
      story_points: story_points || 1,
      sprint: sprint || null,
      status_hu: status_hu || 'To Do',
      tc_id: tc_id || null,
      titulo_tc: titulo_tc,
      // Usar o tipo_teste validado ou o padrão 'E2E'
      tipo_teste: tipo_teste || 'E2E',
      // Usar o status_teste validado ou o padrão 'Not Executed'
      status_teste: status_teste || 'Not Executed',
      resultado_esperado: resultado_esperado || null,
      passos: passos || null,
      requisitos: requisitos || null,
      regra: regra || null,
      prioridade_teste: prioridade_teste || 'Média',
      // Se criticidade_defeito for null/undefined/'' do frontend, insere null no DB
      criticidade_defeito: (criticidade_defeito === null || criticidade_defeito === undefined || criticidade_defeito === '') ? null : criticidade_defeito,
      // Se ambiente for null/undefined/'' do frontend, insere 'Dev' no DB
      ambiente: (ambiente === null || ambiente === undefined || ambiente === '') ? 'Dev' : ambiente,
      bug_id: bug_id || null,
      reaberto: reaberto || 'Não',
      problemas_historia: problemas_historia || null,
      problemas_ux_ui: problemas_ux_ui || null,
      status_automacao: status_automacao || 'Não Automatizado',
      flaky: flaky || 'Não',
      observacoes: observacoes || null,
      evidencia_url: evidencia_url || null,
      data_execucao: data_execucao || null,
      assigned_to: assigned_to || null,
    }

    // ADICIONE ESTE CONSOLE.LOG AQUI NO BACKEND
    console.log('Sanitized Data antes da inserção:', sanitizedData);

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
        ${sanitizedData.feature}, ${sanitizedData.historia_git}, ${sanitizedData.story_points}, ${sanitizedData.sprint},
        ${sanitizedData.status_hu}, ${sanitizedData.tc_id}, ${sanitizedData.titulo_tc},
        ${sanitizedData.tipo_teste}, ${sanitizedData.status_teste}, ${sanitizedData.resultado_esperado},
        ${sanitizedData.passos}, ${sanitizedData.requisitos}, ${sanitizedData.regra},
        ${sanitizedData.prioridade_teste}, ${sanitizedData.criticidade_defeito}, ${sanitizedData.ambiente},
        ${sanitizedData.bug_id}, ${sanitizedData.reaberto},
        ${sanitizedData.problemas_historia}, ${sanitizedData.problemas_ux_ui},
        ${sanitizedData.status_automacao}, ${sanitizedData.flaky},
        ${sanitizedData.observacoes}, ${sanitizedData.evidencia_url}, ${sanitizedData.data_execucao}, ${sanitizedData.assigned_to},
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

// Rota PUT (com correção de params e validação básica)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // Corrigido o tipo de params
) {
  try {
    const { id } = params; // Acessa diretamente params.id
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const data = await request.json();

    // Definir os valores permitidos para ambiente e outros campos com CHECK constraints
    const allowedAmbientes = ['Dev', 'QA', 'Staging', 'Produção'];
    const allowedStatusHu = ['To Do', 'In Progress', 'Done', 'Blocked'];
    const allowedTipoTeste = ['Unit', 'Integration', 'E2E', 'Smoke', 'Regression', 'Exploratory'];
    const allowedStatusTeste = ['Not Executed', 'Pass', 'Fail', 'Blocked'];
    const allowedPrioridadeTeste = ['Baixa', 'Média', 'Alta', 'Crítica'];
    const allowedCriticidadeDefeito = ['Crítica', 'Alta', 'Média', 'Baixa'];
    const allowedSimNao = ['Sim', 'Não'];
    const allowedStatusAutomacao = ['Não Automatizado', 'Em Progresso', 'Automatizado'];

    let isValid = true;
    const validationDetails: { [key: string]: string } = {};

    // --- Validação de Dados para PUT (apenas para campos fornecidos) ---
    // A validação para PUT deve ser mais flexível, validando apenas os campos que foram enviados.

    // titulo_tc (se fornecido)
    if (data.titulo_tc !== undefined && (typeof data.titulo_tc !== 'string' || data.titulo_tc.trim() === '')) {
      validationDetails.titulo_tc = 'Inválido';
      isValid = false;
    } else if (data.titulo_tc !== undefined) {
      validationDetails.titulo_tc = 'OK';
    }

    // story_points (se fornecido)
    if (data.story_points !== undefined && (typeof data.story_points !== 'number' || data.story_points < 1)) {
      validationDetails.story_points = 'Inválido';
      isValid = false;
    } else if (data.story_points !== undefined) {
      validationDetails.story_points = 'OK';
    }

    // status_hu (se fornecido)
    if (data.status_hu !== undefined && !allowedStatusHu.includes(data.status_hu)) {
      validationDetails.status_hu = 'Inválido';
      isValid = false;
    } else if (data.status_hu !== undefined) {
      validationDetails.status_hu = 'OK';
    }

    // tipo_teste (se fornecido)
    if (data.tipo_teste !== undefined && (data.tipo_teste === null || data.tipo_teste === '' || !allowedTipoTeste.includes(data.tipo_teste))) {
      validationDetails.tipo_teste = 'Inválido';
      isValid = false;
    } else if (data.tipo_teste !== undefined) {
      validationDetails.tipo_teste = 'OK';
    }

    // status_teste (se fornecido)
    if (data.status_teste !== undefined && (data.status_teste === null || data.status_teste === '' || !allowedStatusTeste.includes(data.status_teste))) {
      validationDetails.status_teste = 'Inválido';
      isValid = false;
    } else if (data.status_teste !== undefined) {
      validationDetails.status_teste = 'OK';
    }

    // prioridade_teste (se fornecido)
    if (data.prioridade_teste !== undefined && !allowedPrioridadeTeste.includes(data.prioridade_teste)) {
      validationDetails.prioridade_teste = 'Inválido';
      isValid = false;
    } else if (data.prioridade_teste !== undefined) {
      validationDetails.prioridade_teste = 'OK';
    }

    // reaberto (se fornecido)
    if (data.reaberto !== undefined && !allowedSimNao.includes(data.reaberto)) {
      validationDetails.reaberto = 'Inválido';
      isValid = false;
    } else if (data.reaberto !== undefined) {
      validationDetails.reaberto = 'OK';
    }

    // status_automacao (se fornecido)
    if (data.status_automacao !== undefined && !allowedStatusAutomacao.includes(data.status_automacao)) {
      validationDetails.status_automacao = 'Inválido';
      isValid = false;
    } else if (data.status_automacao !== undefined) {
      validationDetails.status_automacao = 'OK';
    }

    // flaky (se fornecido)
    if (data.flaky !== undefined && !allowedSimNao.includes(data.flaky)) {
      validationDetails.flaky = 'Inválido';
      isValid = false;
    } else if (data.flaky !== undefined) {
      validationDetails.flaky = 'OK';
    }

    // ambiente (se fornecido)
    if (data.ambiente !== undefined && (data.ambiente === null || data.ambiente === '' || !allowedAmbientes.includes(data.ambiente))) {
      validationDetails.ambiente = 'Inválido';
      isValid = false;
    } else if (data.ambiente !== undefined) {
      validationDetails.ambiente = 'OK';
    }

    // criticidade_defeito (se fornecido)
    if (data.criticidade_defeito !== undefined && (data.criticidade_defeito === null || data.criticidade_defeito === '' || !allowedCriticidadeDefeito.includes(data.criticidade_defeito))) {
      validationDetails.criticidade_defeito = 'Inválido';
      isValid = false;
    } else if (data.criticidade_defeito !== undefined) {
      validationDetails.criticidade_defeito = 'OK';
    }

    // Se houver erros de validação, retorne-os
    if (!isValid) {
      console.error('Erro de validação na atualização:', validationDetails);
      return NextResponse.json(
        { error: 'Campos inválidos para atualização.', details: validationDetails },
        { status: 400 }
      );
    }

    // --- Sanitização para PUT (aplicar valores padrão para null/undefined/'' antes da atualização) ---
    const sanitizedData: any = { ...data };
    if (sanitizedData.story_points === null || sanitizedData.story_points === '') {
      sanitizedData.story_points = 1;
    }
    if (sanitizedData.status_hu === null || sanitizedData.status_hu === '') {
      sanitizedData.status_hu = 'To Do';
    }
    if (sanitizedData.tipo_teste === null || sanitizedData.tipo_teste === '') {
      sanitizedData.tipo_teste = 'E2E';
    }
    if (sanitizedData.status_teste === null || sanitizedData.status_teste === '') {
      sanitizedData.status_teste = 'Not Executed';
    }
    if (sanitizedData.prioridade_teste === null || sanitizedData.prioridade_teste === '') {
      sanitizedData.prioridade_teste = 'Média';
    }
    if (sanitizedData.reaberto === null || sanitizedData.reaberto === '') {
      sanitizedData.reaberto = 'Não';
    }
    if (sanitizedData.status_automacao === null || sanitizedData.status_automacao === '') {
      sanitizedData.status_automacao = 'Não Automatizado';
    }
    if (sanitizedData.flaky === null || sanitizedData.flaky === '') {
      sanitizedData.flaky = 'Não';
    }
    if (sanitizedData.ambiente === null || sanitizedData.ambiente === '') {
      sanitizedData.ambiente = 'Dev';
    }
    if (sanitizedData.criticidade_defeito === null || sanitizedData.criticidade_defeito === '') {
      sanitizedData.criticidade_defeito = null; // criticidade_defeito pode ser null
    }
    // Campos que podem ser null e não têm padrão no DB
    sanitizedData.feature = sanitizedData.feature || null;
    sanitizedData.historia_git = sanitizedData.historia_git || null;
    sanitizedData.sprint = sanitizedData.sprint || null;
    sanitizedData.tc_id = sanitizedData.tc_id || null;
    sanitizedData.resultado_esperado = sanitizedData.resultado_esperado || null;
    sanitizedData.passos = sanitizedData.passos || null;
    sanitizedData.requisitos = sanitizedData.requisitos || null;
    sanitizedData.regra = sanitizedData.regra || null;
    sanitizedData.bug_id = sanitizedData.bug_id || null;
    sanitizedData.problemas_historia = sanitizedData.problemas_historia || null;
    sanitizedData.problemas_ux_ui = sanitizedData.problemas_ux_ui || null;
    sanitizedData.observacoes = sanitizedData.observacoes || null;
    sanitizedData.evidencia_url = sanitizedData.evidencia_url || null;
    sanitizedData.data_execucao = sanitizedData.data_execucao || null;
    sanitizedData.assigned_to = sanitizedData.assigned_to || null;


    const result = await sql`
      UPDATE test_executions
      SET
        feature = ${sanitizedData.feature},
        historia_git = ${sanitizedData.historia_git},
        story_points = ${sanitizedData.story_points},
        sprint = ${sanitizedData.sprint},
        status_hu = ${sanitizedData.status_hu},
        tc_id = ${sanitizedData.tc_id},
        titulo_tc = ${sanitizedData.titulo_tc},
        tipo_teste = ${sanitizedData.tipo_teste},
        status_teste = ${sanitizedData.status_teste},
        resultado_esperado = ${sanitizedData.resultado_esperado},
        passos = ${sanitizedData.passos},
        requisitos = ${sanitizedData.requisitos},
        regra = ${sanitizedData.regra},
        prioridade_teste = ${sanitizedData.prioridade_teste},
        criticidade_defeito = ${sanitizedData.criticidade_defeito},
        ambiente = ${sanitizedData.ambiente},
        bug_id = ${sanitizedData.bug_id},
        reaberto = ${sanitizedData.reaberto},
        problemas_historia = ${sanitizedData.problemas_historia},
        problemas_ux_ui = ${sanitizedData.problemas_ux_ui},
        status_automacao = ${sanitizedData.status_automacao},
        flaky = ${sanitizedData.flaky},
        observacoes = ${sanitizedData.observacoes},
        evidencia_url = ${sanitizedData.evidencia_url},
        assigned_to = ${sanitizedData.assigned_to},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Execução não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar execução:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar execução', details: (error as Error).message || 'Detalhes não disponíveis' },
      { status: 500 }
    );
  }
}

// Rota DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // Corrigido o tipo de params
) {
  try {
    const { id } = params; // Acessa diretamente params.id
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await sql`DELETE FROM test_executions WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar execução:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar execução', details: (error as Error).message || 'Detalhes não disponíveis' },
      { status: 500 }
    );
  }
}