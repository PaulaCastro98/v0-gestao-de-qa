-- Migration V2: Sistema de QA com Histórias, Casos de Teste e Bugs
-- Estrutura hierárquica: Historia > Casos de Teste > Bugs

-- Drop tabelas antigas se existirem
DROP TABLE IF EXISTS bugs CASCADE;
DROP TABLE IF EXISTS casos_teste CASCADE;
DROP TABLE IF EXISTS historias CASCADE;
DROP TABLE IF EXISTS test_executions CASCADE;

-- ============================================
-- TABELA: HISTÓRIAS (entidade principal)
-- ============================================
CREATE TABLE IF NOT EXISTS historias (
  id SERIAL PRIMARY KEY,
  nome_feature VARCHAR(255) NOT NULL,
  titulo_historia VARCHAR(500) NOT NULL,
  descricao_historia TEXT,
  link_historia VARCHAR(1000),
  status VARCHAR(50) DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Done', 'Blocked')),
  sprint VARCHAR(100),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: CASOS DE TESTE (vinculados a histórias)
-- ============================================
CREATE TABLE IF NOT EXISTS casos_teste (
  id SERIAL PRIMARY KEY,
  historia_id INTEGER NOT NULL REFERENCES historias(id) ON DELETE CASCADE,
  tc_id VARCHAR(50) NOT NULL,
  titulo VARCHAR(500) NOT NULL,
  passos TEXT,
  requisitos TEXT,
  regra TEXT,
  resultado_esperado TEXT,
  status_hu VARCHAR(50) DEFAULT 'To Do' CHECK (status_hu IN ('To Do', 'In Progress', 'Done')),
  tipo_teste VARCHAR(100) CHECK (tipo_teste IN ('Funcional', 'Regressivo', 'Exploratório', 'Smoke', 'Integração', 'E2E', 'API', 'Performance')),
  prioridade_teste VARCHAR(50) DEFAULT 'Média' CHECK (prioridade_teste IN ('Crítica', 'Alta', 'Média', 'Baixa')),
  criticidade_defeito VARCHAR(50) CHECK (criticidade_defeito IN ('Crítico', 'Alto', 'Médio', 'Baixo')),
  problema_historia_requisito TEXT,
  problema_ux_ui TEXT,
  status_automacao VARCHAR(50) DEFAULT 'Não Automatizado' CHECK (status_automacao IN ('Automatizado', 'Em Automação', 'Não Automatizado', 'N/A')),
  observacoes_adicionais TEXT,
  status_teste VARCHAR(50) DEFAULT 'Não Executado' CHECK (status_teste IN ('Aprovado', 'Reprovado', 'Bloqueado', 'Não Executado', 'Em Andamento')),
  data_execucao TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: BUGS (vinculados a casos de teste reprovados)
-- ============================================
CREATE TABLE IF NOT EXISTS bugs (
  id SERIAL PRIMARY KEY,
  caso_teste_id INTEGER NOT NULL REFERENCES casos_teste(id) ON DELETE CASCADE,
  tarefa_bug VARCHAR(255) NOT NULL,
  descricao TEXT,
  sprint VARCHAR(100),
  data_execucao TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em Análise', 'Corrigido', 'Fechado', 'Reaberto')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: EVIDÊNCIAS (imagens vinculadas a bugs)
-- ============================================
CREATE TABLE IF NOT EXISTS evidencias (
  id SERIAL PRIMARY KEY,
  bug_id INTEGER NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  nome_arquivo VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  pathname VARCHAR(500),
  tipo VARCHAR(100),
  tamanho INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_historias_sprint ON historias(sprint);
CREATE INDEX IF NOT EXISTS idx_historias_status ON historias(status);
CREATE INDEX IF NOT EXISTS idx_casos_teste_historia ON casos_teste(historia_id);
CREATE INDEX IF NOT EXISTS idx_casos_teste_status ON casos_teste(status_teste);
CREATE INDEX IF NOT EXISTS idx_bugs_caso_teste ON bugs(caso_teste_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_bug ON evidencias(bug_id);
