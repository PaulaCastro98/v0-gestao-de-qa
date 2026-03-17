-- Create test cases table
CREATE TABLE IF NOT EXISTS test_cases (
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

-- Create evidence/attachments table
CREATE TABLE IF NOT EXISTS evidencias (
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

-- Create audit log table
CREATE TABLE IF NOT EXISTS historico_alteracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  usuario VARCHAR(255) NOT NULL,
  acao VARCHAR(100) NOT NULL,
  campo_alterado VARCHAR(255),
  valor_antigo TEXT,
  valor_novo TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create aggregated metrics table
CREATE TABLE IF NOT EXISTS metricas_sprint (
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

-- Create indexes for better query performance
CREATE INDEX idx_test_cases_sprint ON test_cases(sprint);
CREATE INDEX idx_test_cases_status_teste ON test_cases(status_teste);
CREATE INDEX idx_test_cases_qa_responsavel ON test_cases(qa_responsavel);
CREATE INDEX idx_test_cases_data_execucao ON test_cases(data_execucao);
CREATE INDEX idx_historico_test_case_id ON historico_alteracoes(test_case_id);
CREATE INDEX idx_evidencias_test_case_id ON evidencias(test_case_id);
CREATE INDEX idx_metricas_sprint ON metricas_sprint(sprint);
