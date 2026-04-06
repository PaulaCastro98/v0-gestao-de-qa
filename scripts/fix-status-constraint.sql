-- Fix test_cases status constraint to accept application values
ALTER TABLE test_cases DROP CONSTRAINT IF EXISTS test_cases_status_check;

ALTER TABLE test_cases ADD CONSTRAINT test_cases_status_check 
CHECK (status IN ('Não Iniciado', 'Pendente', 'Em Progresso', 'Concluído', 'Bloqueado', 'Falhou', 'Passou', 'Pulado'));
