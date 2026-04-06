-- Adiciona coluna nome para membros por texto livre (sem FK para users)
ALTER TABLE project_members
  ADD COLUMN IF NOT EXISTS nome VARCHAR(255),
  ADD COLUMN IF NOT EXISTS avatar_initials VARCHAR(5);

-- Torna user_id opcional (membros podem ser cadastrados sem conta no sistema)
ALTER TABLE project_members
  ALTER COLUMN user_id DROP NOT NULL;
