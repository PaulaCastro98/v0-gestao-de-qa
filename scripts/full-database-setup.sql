-- =============================================
-- SISTEMA DE GESTÃO DE QA - SETUP COMPLETO
-- =============================================

-- Remover tabelas existentes para recriação limpa
DROP TABLE IF EXISTS evidencias CASCADE;
DROP TABLE IF EXISTS historico_alteracoes CASCADE;
DROP TABLE IF EXISTS metricas_sprint CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- 1. TABELA DE USUÁRIOS
-- =============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. TABELA DE SESSÕES
-- =============================================
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. TABELA DE TOKENS DE RESET DE SENHA
-- =============================================
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. TABELA DE CASOS DE TESTE
-- =============================================
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  historia_git VARCHAR(255) NOT NULL,
  link_hu_git VARCHAR(512),
  status_hu VARCHAR(50) NOT NULL DEFAULT 'Aberta',
  tc_id VARCHAR(50) NOT NULL UNIQUE,
  titulo_tc VARCHAR(255) NOT NULL,
  descricao_objetivo TEXT,
  passos TEXT NOT NULL,
  pre_condicoes TEXT,
  requisitos VARCHAR(255),
  regra TEXT,
  resultado_esperado TEXT NOT NULL,
  desenvolvedor_responsavel VARCHAR(255),
  status_hu_responsavel VARCHAR(255),
  tipo_teste VARCHAR(50) NOT NULL,
  prioridade_teste VARCHAR(50) NOT NULL,
  criticidade_defeito VARCHAR(50),
  problemas_historia_requisito TEXT,
  problemas_ux_ui TEXT,
  status_automacao VARCHAR(50) NOT NULL DEFAULT 'Não Aplicável',
  observacoes_adicionais TEXT,
  status_teste VARCHAR(50) NOT NULL DEFAULT 'Não Executado',
  tarefa_bug VARCHAR(255),
  data_execucao DATE,
  sprint VARCHAR(100),
  ambiente_teste VARCHAR(100),
  versao_build VARCHAR(100),
  qa_responsavel VARCHAR(255),
  tempo_estimado_min INTEGER,
  tempo_executado_min INTEGER,
  retestes_necessarios INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  CONSTRAINT valid_status_hu CHECK (status_hu IN ('Aberta', 'Em Progresso', 'Concluída', 'Bloqueada')),
  CONSTRAINT valid_tipo_teste CHECK (tipo_teste IN ('Funcional', 'Regressão', 'Integração', 'E2E', 'UI', 'Performance', 'Segurança', 'Exploratório', 'Outro')),
  CONSTRAINT valid_prioridade CHECK (prioridade_teste IN ('Baixa', 'Média', 'Alta', 'Crítica')),
  CONSTRAINT valid_criticidade CHECK (criticidade_defeito IS NULL OR criticidade_defeito IN ('Baixa', 'Média', 'Alta', 'Crítica')),
  CONSTRAINT valid_status_automacao CHECK (status_automacao IN ('Não Aplicável', 'Não Iniciado', 'Em Progresso', 'Automatizado', 'Quebrado')),
  CONSTRAINT valid_status_teste CHECK (status_teste IN ('Não Executado', 'Passou', 'Falhou', 'Bloqueado'))
);

-- =============================================
-- 5. TABELA DE EVIDÊNCIAS
-- =============================================
CREATE TABLE evidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  nome_arquivo VARCHAR(255) NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  tamanho_bytes INTEGER NOT NULL,
  link_armazenamento VARCHAR(512) NOT NULL,
  hash_sha256 VARCHAR(64),
  uploaded_by VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. TABELA DE HISTÓRICO DE ALTERAÇÕES
-- =============================================
CREATE TABLE historico_alteracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  usuario VARCHAR(255) NOT NULL,
  acao VARCHAR(100) NOT NULL,
  campo_alterado VARCHAR(255),
  valor_antigo TEXT,
  valor_novo TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. TABELA DE MÉTRICAS POR SPRINT
-- =============================================
CREATE TABLE metricas_sprint (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint VARCHAR(100) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_casos_executados INTEGER DEFAULT 0,
  total_passaram INTEGER DEFAULT 0,
  total_falharam INTEGER DEFAULT 0,
  taxa_passagem NUMERIC(5, 2) DEFAULT 0,
  total_bugs_abertos INTEGER DEFAULT 0,
  media_tempo_execucao_min NUMERIC(10, 2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sprint)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_test_cases_sprint ON test_cases(sprint);
CREATE INDEX idx_test_cases_status_teste ON test_cases(status_teste);
CREATE INDEX idx_test_cases_qa_responsavel ON test_cases(qa_responsavel);
CREATE INDEX idx_test_cases_data_execucao ON test_cases(data_execucao);
CREATE INDEX idx_historico_test_case_id ON historico_alteracoes(test_case_id);
CREATE INDEX idx_evidencias_test_case_id ON evidencias(test_case_id);
CREATE INDEX idx_metricas_sprint ON metricas_sprint(sprint);

-- =============================================
-- DADOS DE TESTE - USUÁRIOS
-- =============================================
-- Senha: teste123 (bcrypt hash)
INSERT INTO users (email, password_hash, nome, empresa, telefone, cargo, ativo) VALUES
('teste@qa.com', '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm', 'Usuário de Teste', 'QA Systems', '(11) 99999-9999', 'QA Analyst', true),
('admin@qa.com', '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm', 'Administrador', 'QA Systems', '(11) 88888-8888', 'QA Lead', true),
('maria.silva@qa.com', '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm', 'Maria Silva', 'QA Systems', '(11) 77777-7777', 'QA Engineer', true);

-- =============================================
-- DADOS DE TESTE - CASOS DE TESTE
-- =============================================
INSERT INTO test_cases (
  historia_git, link_hu_git, status_hu, tc_id, titulo_tc, descricao_objetivo, passos, 
  pre_condicoes, requisitos, resultado_esperado, desenvolvedor_responsavel, tipo_teste, 
  prioridade_teste, status_automacao, status_teste, sprint, ambiente_teste, 
  versao_build, qa_responsavel, tempo_estimado_min, data_execucao
) VALUES
(
  'HU-001', 'https://github.com/empresa/projeto/issues/1', 'Em Progresso', 'TC-001', 
  'Validar login com credenciais válidas', 
  'Verificar se o usuário consegue fazer login com email e senha corretos',
  '1. Acessar a página de login
2. Inserir email válido
3. Inserir senha correta
4. Clicar em "Entrar"',
  'Usuário deve estar cadastrado no sistema',
  'RF-001',
  'Sistema deve redirecionar para dashboard após login bem-sucedido',
  'João Santos',
  'Funcional',
  'Alta',
  'Automatizado',
  'Passou',
  'Sprint 1',
  'Homologação',
  'v1.0.0',
  'Maria Silva',
  15,
  CURRENT_DATE - INTERVAL '2 days'
),
(
  'HU-001', 'https://github.com/empresa/projeto/issues/1', 'Em Progresso', 'TC-002', 
  'Validar login com senha incorreta', 
  'Verificar se o sistema exibe mensagem de erro ao tentar login com senha errada',
  '1. Acessar a página de login
2. Inserir email válido
3. Inserir senha incorreta
4. Clicar em "Entrar"',
  'Usuário deve estar cadastrado no sistema',
  'RF-001',
  'Sistema deve exibir mensagem "Credenciais inválidas"',
  'João Santos',
  'Funcional',
  'Alta',
  'Automatizado',
  'Passou',
  'Sprint 1',
  'Homologação',
  'v1.0.0',
  'Maria Silva',
  10,
  CURRENT_DATE - INTERVAL '2 days'
),
(
  'HU-002', 'https://github.com/empresa/projeto/issues/2', 'Aberta', 'TC-003', 
  'Criar novo caso de teste via formulário', 
  'Verificar se é possível criar um novo caso de teste preenchendo todos os campos obrigatórios',
  '1. Acessar a página de casos de teste
2. Clicar em "Novo Caso"
3. Preencher campos obrigatórios
4. Clicar em "Salvar"',
  'Usuário deve estar autenticado',
  'RF-002',
  'Caso de teste deve ser criado e exibido na lista',
  'Ana Costa',
  'Funcional',
  'Crítica',
  'Não Iniciado',
  'Não Executado',
  'Sprint 2',
  'Desenvolvimento',
  'v1.1.0',
  'Usuário de Teste',
  20,
  NULL
),
(
  'HU-002', 'https://github.com/empresa/projeto/issues/2', 'Aberta', 'TC-004', 
  'Editar caso de teste existente', 
  'Verificar se é possível editar um caso de teste já cadastrado',
  '1. Acessar lista de casos de teste
2. Selecionar um caso existente
3. Clicar em "Editar"
4. Alterar campos desejados
5. Clicar em "Salvar"',
  'Deve existir pelo menos um caso de teste cadastrado',
  'RF-002',
  'Alterações devem ser salvas e refletidas na visualização',
  'Ana Costa',
  'Funcional',
  'Alta',
  'Não Aplicável',
  'Falhou',
  'Sprint 2',
  'Homologação',
  'v1.1.0',
  'Usuário de Teste',
  15,
  CURRENT_DATE - INTERVAL '1 day'
),
(
  'HU-003', 'https://github.com/empresa/projeto/issues/3', 'Concluída', 'TC-005', 
  'Validar filtro por sprint', 
  'Verificar se o filtro por sprint funciona corretamente na lista de casos',
  '1. Acessar lista de casos de teste
2. Selecionar um sprint no filtro
3. Verificar resultados',
  'Devem existir casos em diferentes sprints',
  'RF-003',
  'Lista deve exibir apenas casos do sprint selecionado',
  'Pedro Lima',
  'Funcional',
  'Média',
  'Em Progresso',
  'Passou',
  'Sprint 1',
  'Homologação',
  'v1.0.0',
  'Maria Silva',
  10,
  CURRENT_DATE - INTERVAL '3 days'
),
(
  'HU-003', 'https://github.com/empresa/projeto/issues/3', 'Concluída', 'TC-006', 
  'Validar filtro por status', 
  'Verificar se o filtro por status funciona corretamente',
  '1. Acessar lista de casos de teste
2. Selecionar um status no filtro
3. Verificar resultados',
  'Devem existir casos com diferentes status',
  'RF-003',
  'Lista deve exibir apenas casos com o status selecionado',
  'Pedro Lima',
  'Funcional',
  'Média',
  'Automatizado',
  'Passou',
  'Sprint 1',
  'Homologação',
  'v1.0.0',
  'Maria Silva',
  10,
  CURRENT_DATE - INTERVAL '3 days'
),
(
  'HU-004', 'https://github.com/empresa/projeto/issues/4', 'Em Progresso', 'TC-007', 
  'Gerar relatório de métricas', 
  'Verificar se o dashboard exibe métricas corretas por sprint',
  '1. Acessar dashboard de métricas
2. Selecionar sprint
3. Verificar gráficos e números',
  'Devem existir casos executados',
  'RF-004',
  'Dashboard deve exibir taxa de aprovação, total de casos e gráficos',
  'Carlos Souza',
  'E2E',
  'Alta',
  'Não Aplicável',
  'Não Executado',
  'Sprint 2',
  'Desenvolvimento',
  'v1.1.0',
  'Administrador',
  30,
  NULL
),
(
  'HU-005', 'https://github.com/empresa/projeto/issues/5', 'Bloqueada', 'TC-008', 
  'Upload de evidência em caso de teste', 
  'Verificar se é possível anexar evidências (screenshots) a um caso de teste',
  '1. Acessar detalhes de um caso de teste
2. Clicar em "Adicionar Evidência"
3. Selecionar arquivo de imagem
4. Confirmar upload',
  'Caso de teste deve estar com status "Executado"',
  'RF-005',
  'Arquivo deve ser salvo e exibido na lista de evidências',
  'Ana Costa',
  'Funcional',
  'Média',
  'Não Aplicável',
  'Bloqueado',
  'Sprint 3',
  'Desenvolvimento',
  'v1.2.0',
  'Usuário de Teste',
  20,
  NULL
),
(
  'HU-006', 'https://github.com/empresa/projeto/issues/6', 'Aberta', 'TC-009', 
  'Testar performance de listagem com 1000+ casos', 
  'Verificar tempo de carregamento da lista com grande volume de dados',
  '1. Popular banco com 1000+ casos
2. Acessar lista de casos
3. Medir tempo de carregamento
4. Verificar se paginação funciona',
  'Banco deve ter 1000+ registros',
  'RNF-001',
  'Lista deve carregar em menos de 3 segundos',
  'Pedro Lima',
  'Performance',
  'Alta',
  'Não Iniciado',
  'Não Executado',
  'Sprint 3',
  'Performance',
  'v1.2.0',
  'Administrador',
  60,
  NULL
),
(
  'HU-007', 'https://github.com/empresa/projeto/issues/7', 'Concluída', 'TC-010', 
  'Validar responsividade em dispositivos móveis', 
  'Verificar se a interface se adapta corretamente em telas menores',
  '1. Acessar aplicação em smartphone
2. Navegar pelas principais telas
3. Verificar layout e usabilidade',
  'Acesso via dispositivo móvel ou emulador',
  'RNF-002',
  'Interface deve ser utilizável em telas de 320px+',
  'Carlos Souza',
  'UI',
  'Média',
  'Não Aplicável',
  'Passou',
  'Sprint 1',
  'Homologação',
  'v1.0.0',
  'Maria Silva',
  45,
  CURRENT_DATE - INTERVAL '5 days'
);

-- =============================================
-- DADOS DE TESTE - MÉTRICAS POR SPRINT
-- =============================================
INSERT INTO metricas_sprint (sprint, period_start, period_end, total_casos_executados, total_passaram, total_falharam, taxa_passagem, total_bugs_abertos, media_tempo_execucao_min) VALUES
('Sprint 1', '2024-01-01', '2024-01-14', 6, 5, 1, 83.33, 1, 15.0),
('Sprint 2', '2024-01-15', '2024-01-28', 2, 0, 1, 0.00, 2, 17.5),
('Sprint 3', '2024-01-29', '2024-02-11', 0, 0, 0, 0.00, 0, 0.0);

-- =============================================
-- DADOS DE TESTE - HISTÓRICO DE ALTERAÇÕES
-- =============================================
INSERT INTO historico_alteracoes (test_case_id, usuario, acao, campo_alterado, valor_antigo, valor_novo)
SELECT id, 'Maria Silva', 'CRIAÇÃO', NULL, NULL, NULL FROM test_cases WHERE tc_id = 'TC-001';

INSERT INTO historico_alteracoes (test_case_id, usuario, acao, campo_alterado, valor_antigo, valor_novo)
SELECT id, 'Maria Silva', 'EXECUÇÃO', 'status_teste', 'Não Executado', 'Passou' FROM test_cases WHERE tc_id = 'TC-001';

INSERT INTO historico_alteracoes (test_case_id, usuario, acao, campo_alterado, valor_antigo, valor_novo)
SELECT id, 'Usuário de Teste', 'ATUALIZAÇÃO', 'prioridade_teste', 'Média', 'Crítica' FROM test_cases WHERE tc_id = 'TC-003';

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================
SELECT 'Usuários criados: ' || COUNT(*) FROM users;
SELECT 'Casos de teste criados: ' || COUNT(*) FROM test_cases;
SELECT 'Métricas por sprint: ' || COUNT(*) FROM metricas_sprint;
SELECT 'Registros de histórico: ' || COUNT(*) FROM historico_alteracoes;
