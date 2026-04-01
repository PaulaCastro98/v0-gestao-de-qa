-- Deletar usuários antigos para começar limpo
DELETE FROM sessions WHERE TRUE;
DELETE FROM password_reset_tokens WHERE TRUE;
DELETE FROM users WHERE TRUE;

-- Inserir usuários de teste (senha: teste123)
-- Hash bcrypt: $2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm
INSERT INTO users (email, password_hash, nome, empresa, telefone, ativo, created_at, updated_at) VALUES
('admin@admin.com.br', '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm', 'Admin', 'QA Manager', '(11) 99999-9999', true, NOW(), NOW()),
('teste@qa.com', '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm', 'Usuário Teste', 'QA Test', '(11) 98888-8888', true, NOW(), NOW()),
('maria.silva@qa.com', '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm', 'Maria Silva', 'QA Manager', '(11) 97777-7777', true, NOW(), NOW());

SELECT id, email, nome FROM users;
