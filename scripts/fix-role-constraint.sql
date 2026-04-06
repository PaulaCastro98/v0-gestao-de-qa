-- Remove a constraint antiga de role e adiciona nova com os valores corretos
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_role_check;

-- Adiciona nova constraint com os valores DEV, PO, QA, UX, Scrum
ALTER TABLE project_members ADD CONSTRAINT project_members_role_check 
  CHECK (role IN ('DEV', 'PO', 'QA', 'UX', 'Scrum', 'Desenvolvedor', 'Admin'));
