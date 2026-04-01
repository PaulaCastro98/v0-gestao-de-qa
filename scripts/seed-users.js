import { neon } from '@neondatabase/serverless'
import * as crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL)

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${derivedKey.toString('hex')}:${salt}`)
    })
  })
}

async function main() {
  console.log('Limpando tabelas...')
  
  await sql`DELETE FROM evidencias WHERE TRUE`
  await sql`DELETE FROM bugs WHERE TRUE`
  await sql`DELETE FROM casos_teste WHERE TRUE`
  await sql`DELETE FROM historias WHERE TRUE`
  await sql`DELETE FROM sessions WHERE TRUE`
  await sql`DELETE FROM password_reset_tokens WHERE TRUE`
  await sql`DELETE FROM users WHERE TRUE`
  
  console.log('Tabelas limpas.')
  
  const passwordHash = await hashPassword('teste123')
  console.log('Hash gerado:', passwordHash.substring(0, 50) + '...')
  
  console.log('Inserindo usuarios...')
  
  await sql`
    INSERT INTO users (email, password_hash, nome, empresa, telefone, ativo, created_at, updated_at)
    VALUES ('admin@admin.com.br', ${passwordHash}, 'Admin', 'QA Manager', '(11) 99999-9999', true, NOW(), NOW())
  `
  
  const passwordHash2 = await hashPassword('teste123')
  await sql`
    INSERT INTO users (email, password_hash, nome, empresa, telefone, ativo, created_at, updated_at)
    VALUES ('teste@qa.com', ${passwordHash2}, 'Usuario Teste', 'QA Test', '(11) 98888-8888', true, NOW(), NOW())
  `
  
  const users = await sql`SELECT id, email, nome FROM users`
  console.log('Usuarios criados:', users)
  
  console.log('Seed concluido com sucesso!')
}

main().catch(console.error)
