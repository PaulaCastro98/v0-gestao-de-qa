-- Criar usuário de teste
-- Email: teste@qa.com
-- Senha: teste123 (hash bcrypt)
INSERT INTO users (email, password_hash, nome, empresa, telefone, ativo, created_at, updated_at)
VALUES (
  'teste@qa.com',
  '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm',
  'Usuário de Teste',
  'QA Test',
  '(11) 99999-9999',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se o usuário foi criado
SELECT id, email, nome, empresa FROM users WHERE email = 'teste@qa.com';
