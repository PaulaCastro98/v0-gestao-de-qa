-- QA Management System - Complete Schema
-- Drop existing tables to start fresh
DROP TABLE IF EXISTS bug_attachments CASCADE;
DROP TABLE IF EXISTS bugs CASCADE;
DROP TABLE IF EXISTS test_run_results CASCADE;
DROP TABLE IF EXISTS test_runs CASCADE;
DROP TABLE IF EXISTS test_plan_cases CASCADE;
DROP TABLE IF EXISTS test_plans CASCADE;
DROP TABLE IF EXISTS test_case_steps CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS test_suites CASCADE;
DROP TABLE IF EXISTS kanban_cards CASCADE;
DROP TABLE IF EXISTS kanban_columns CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Members
CREATE TABLE project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) CHECK (role IN ('Desenvolvedor', 'QA', 'PO', 'Admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Kanban Columns
CREATE TABLE kanban_columns (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kanban Cards
CREATE TABLE kanban_cards (
  id SERIAL PRIMARY KEY,
  column_id INTEGER REFERENCES kanban_columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('Sprint', 'Epico', 'Historia', 'Feature', 'Bug', 'Tarefa')),
  priority VARCHAR(20) CHECK (priority IN ('Alta', 'Media', 'Baixa')),
  assignee_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'A Fazer',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Suites
CREATE TABLE test_suites (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pre_condition TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Cases
CREATE TABLE test_cases (
  id SERIAL PRIMARY KEY,
  suite_id INTEGER REFERENCES test_suites(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  pre_condition TEXT,
  post_condition TEXT,
  severity VARCHAR(20) CHECK (severity IN ('Blocker', 'Critical', 'Major', 'Minor', 'Trivial')),
  status VARCHAR(20) CHECK (status IN ('Actual', 'Draft', 'Deprecated')) DEFAULT 'Draft',
  priority VARCHAR(20) CHECK (priority IN ('High', 'Medium', 'Low')),
  behavior VARCHAR(20) CHECK (behavior IN ('Not set', 'Positive', 'Negative', 'Destructive')) DEFAULT 'Not set',
  type VARCHAR(50) CHECK (type IN ('Functional', 'UI', 'Performance', 'Security', 'Other')) DEFAULT 'Functional',
  is_flaky BOOLEAN DEFAULT FALSE,
  milestone VARCHAR(255),
  layer VARCHAR(100),
  automation_status VARCHAR(50) CHECK (automation_status IN ('Manual', 'To be automated', 'Automated')) DEFAULT 'Manual',
  tags TEXT[],
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Case Steps
CREATE TABLE test_case_steps (
  id SERIAL PRIMARY KEY,
  test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  action TEXT NOT NULL,
  expected_result TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test Plans
CREATE TABLE test_plans (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Plan Cases (junction table)
CREATE TABLE test_plan_cases (
  id SERIAL PRIMARY KEY,
  test_plan_id INTEGER REFERENCES test_plans(id) ON DELETE CASCADE,
  test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(test_plan_id, test_case_id)
);

-- Test Runs
CREATE TABLE test_runs (
  id SERIAL PRIMARY KEY,
  test_plan_id INTEGER REFERENCES test_plans(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Em Andamento',
  executed_by INTEGER REFERENCES users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Test Run Results
CREATE TABLE test_run_results (
  id SERIAL PRIMARY KEY,
  test_run_id INTEGER REFERENCES test_runs(id) ON DELETE CASCADE,
  test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('Passou', 'Falhou', 'Bloqueado', 'Ignorado', 'Pendente')) DEFAULT 'Pendente',
  executed_by INTEGER REFERENCES users(id),
  executed_at TIMESTAMP,
  notes TEXT,
  UNIQUE(test_run_id, test_case_id)
);

-- Bugs
CREATE TABLE bugs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  test_run_result_id INTEGER REFERENCES test_run_results(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('Aberto', 'Em Andamento', 'Resolvido', 'Fechado', 'Reaberto')) DEFAULT 'Aberto',
  severity VARCHAR(20) CHECK (severity IN ('Blocker', 'Critical', 'Major', 'Minor', 'Trivial')),
  priority VARCHAR(20) CHECK (priority IN ('Alta', 'Media', 'Baixa')),
  sprint_release VARCHAR(100),
  feature_story VARCHAR(255),
  assignee_id INTEGER REFERENCES users(id),
  developer_id INTEGER REFERENCES users(id),
  adjustment TEXT,
  comments TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bug Attachments
CREATE TABLE bug_attachments (
  id SERIAL PRIMARY KEY,
  bug_id INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_kanban_columns_project ON kanban_columns(project_id);
CREATE INDEX idx_kanban_cards_column ON kanban_cards(column_id);
CREATE INDEX idx_test_suites_project ON test_suites(project_id);
CREATE INDEX idx_test_cases_suite ON test_cases(suite_id);
CREATE INDEX idx_test_case_steps_case ON test_case_steps(test_case_id);
CREATE INDEX idx_test_plans_project ON test_plans(project_id);
CREATE INDEX idx_test_runs_plan ON test_runs(test_plan_id);
CREATE INDEX idx_bugs_project ON bugs(project_id);
CREATE INDEX idx_bugs_status ON bugs(status);
