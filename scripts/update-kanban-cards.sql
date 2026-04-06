-- Adicionar novos campos ao kanban_cards
ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS responsaveis TEXT[] DEFAULT '{}';
ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS prioridade_num INTEGER DEFAULT 0;
ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS sprint_num INTEGER;
ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS estimativa TEXT[] DEFAULT '{}';
ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS tipo_trabalho VARCHAR(100);

-- Remover constraint antiga de priority se existir
ALTER TABLE kanban_cards DROP CONSTRAINT IF EXISTS kanban_cards_priority_check;

-- Tornar priority opcional (pode ser NULL)
ALTER TABLE kanban_cards ALTER COLUMN priority DROP NOT NULL;
