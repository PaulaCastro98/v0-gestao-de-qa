-- Criar usuário admin
-- Email: admin@admin.com.br
-- Senha: teste123 (hash bcrypt)

INSERT INTO users (email, password_hash, nome, empresa, telefone, ativo, created_at, updated_at)
VALUES (
  'admin@admin.com.br',
  '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm',
  'Administrador',
  'QA Manager',
  '(11) 99999-9999',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$YIjlrPNo64y4Jv.9vY8h5OPST9/PgBkqquzi.Ee8jYpLxo0OS5pDm',
  updated_at = NOW();

-- Verificar se o usuário foi criado
SELECT id, email, nome, empresa FROM users WHERE email = 'admin@admin.com.br';
