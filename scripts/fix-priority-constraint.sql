-- Fix priority constraint in test_cases table to accept Baixa, Média, Alta, Urgente
ALTER TABLE test_cases DROP CONSTRAINT IF EXISTS test_cases_priority_check;

ALTER TABLE test_cases ADD CONSTRAINT test_cases_priority_check 
  CHECK (priority IN ('Baixa', 'Média', 'Alta', 'Urgente') OR priority IS NULL);
