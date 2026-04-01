// lib/auth.ts
import * as crypto from 'crypto'

// Parâmetros PBKDF2 (devem ser consistentes entre hash e verify)
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64; // 64 bytes = 512 bits
const PBKDF2_DIGEST = 'sha512';
const SALT_BYTES = 16; // 16 bytes para o salt

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex'); // Gerar o salt
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${derivedKey.toString('hex')}:${salt}`) // Retornar hash:salt
    })
  })
}


export async function verifyPassword(password: string, combinedHashAndSalt: string): Promise<boolean> {
  // combinedHashAndSalt agora deve estar no formato "hash:salt"
  const [storedHash, storedSalt] = combinedHashAndSalt.split(':')

  if (!storedHash || !storedSalt) {
    console.error('Formato de hash inválido: esperado "hash:salt"')
    return false
  }

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, storedSalt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(derivedKey.toString('hex') === storedHash)
    })
  })
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}