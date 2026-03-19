-- Criar usuário de teste
-- Senha: teste123 (hash bcrypt)
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Usuário Teste',
  'teste@qa.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'qa_analyst'
)
ON CONFLICT (email) DO NOTHING;
