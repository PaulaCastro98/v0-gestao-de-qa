-- ============================================================
-- Controle de QA — Schema completo conforme especificação
-- ============================================================

-- Dropar tabela antiga e recriar com os novos campos
DROP TABLE IF EXISTS evidencias CASCADE;
DROP TABLE IF EXISTS historico_alteracoes CASCADE;
DROP TABLE IF EXISTS metricas_sprint CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;

-- Tabela principal: execucoes de casos de teste
CREATE TABLE IF NOT EXISTS test_executions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Feature / Historia
  feature          TEXT,
  historia_git     TEXT,
  story_points     INTEGER NOT NULL DEFAULT 1,
  sprint           VARCHAR(50),
  status_hu        VARCHAR(50) NOT NULL DEFAULT 'To Do',

  -- Caso de Teste
  tc_id            VARCHAR(100),
  titulo_tc        TEXT NOT NULL,
  tipo_teste       VARCHAR(50) NOT NULL DEFAULT 'E2E',
  status_teste     VARCHAR(50) NOT NULL DEFAULT 'Not Executed',
  resultado_esperado TEXT,
  passos           TEXT,
  requisitos       TEXT,
  regra            TEXT,
  prioridade_teste VARCHAR(50) NOT NULL DEFAULT 'Média',
  criticidade_defeito VARCHAR(50),
  ambiente         VARCHAR(50) NOT NULL DEFAULT 'Dev',

  -- Bug
  bug_id           TEXT,
  bug_created_at   TIMESTAMPTZ,
  bug_resolved_at  TIMESTAMPTZ,
  reaberto         VARCHAR(10) NOT NULL DEFAULT 'Não',

  -- QA Insights
  problemas_historia TEXT,
  problemas_ux_ui    TEXT,

  -- Automação
  status_automacao VARCHAR(50) NOT NULL DEFAULT 'Não Automatizado',
  flaky            VARCHAR(10) NOT NULL DEFAULT 'Não',

  -- Extra
  observacoes      TEXT,
  evidencia_url    TEXT,
  data_execucao    TIMESTAMPTZ,
  assigned_to      TEXT,

  -- Auditoria
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by       TEXT,

  -- Constraints
  CONSTRAINT chk_status_hu       CHECK (status_hu       IN ('To Do','In Progress','Done')),
  CONSTRAINT chk_tipo_teste      CHECK (tipo_teste       IN ('Unit','Integration','E2E','Smoke','Regression','Exploratory')),
  CONSTRAINT chk_status_teste    CHECK (status_teste     IN ('Not Executed','Pass','Fail','Blocked')),
  CONSTRAINT chk_prioridade      CHECK (prioridade_teste IN ('Baixa','Média','Alta')),
  CONSTRAINT chk_criticidade     CHECK (criticidade_defeito IS NULL OR criticidade_defeito IN ('P0-Crítico','P1-Alto','P2-Médio','P3-Baixo')),
  CONSTRAINT chk_ambiente        CHECK (ambiente         IN ('Dev','Homolog','Produção')),
  CONSTRAINT chk_reaberto        CHECK (reaberto         IN ('Sim','Não')),
  CONSTRAINT chk_status_auto     CHECK (status_automacao IN ('Não Automatizado','Em Progresso','Automatizado')),
  CONSTRAINT chk_flaky           CHECK (flaky            IN ('Sim','Não'))
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_te_sprint         ON test_executions(sprint);
CREATE INDEX IF NOT EXISTS idx_te_status_teste   ON test_executions(status_teste);
CREATE INDEX IF NOT EXISTS idx_te_ambiente       ON test_executions(ambiente);
CREATE INDEX IF NOT EXISTS idx_te_feature        ON test_executions(feature);
CREATE INDEX IF NOT EXISTS idx_te_historia_git   ON test_executions(historia_git);
CREATE INDEX IF NOT EXISTS idx_te_status_hu      ON test_executions(status_hu);
CREATE INDEX IF NOT EXISTS idx_te_data_execucao  ON test_executions(data_execucao);
CREATE INDEX IF NOT EXISTS idx_te_bug_id         ON test_executions(bug_id);
