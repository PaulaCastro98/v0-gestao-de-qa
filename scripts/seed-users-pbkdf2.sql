-- Limpar todas as tabelas respeitando foreign keys
DELETE FROM evidencias WHERE TRUE;
DELETE FROM bugs WHERE TRUE;
DELETE FROM casos_teste WHERE TRUE;
DELETE FROM historias WHERE TRUE;
DELETE FROM sessions WHERE TRUE;
DELETE FROM password_reset_tokens WHERE TRUE;
DELETE FROM users WHERE TRUE;

-- Inserir usuarios de teste com hash PBKDF2 (senha: teste123)
-- Hash gerado com PBKDF2: crypto.pbkdf2('teste123', salt, 100000, 64, 'sha512')
-- Formato: hash:salt

-- Para teste, vamos inserir um hash conhecido
-- Salt: 0123456789abcdef (hex)
-- Este e um placeholder - o primeiro login via registro vai criar usuarios com o hash correto

INSERT INTO users (email, password_hash, nome, empresa, telefone, ativo, created_at, updated_at) VALUES
('admin@admin.com.br', 'a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4:0123456789abcdef0123456789abcdef', 'Admin', 'QA Manager', '(11) 99999-9999', true, NOW(), NOW());

-- Verificar usuarios
SELECT id, email, nome FROM users;
