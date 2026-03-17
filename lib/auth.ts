import * as crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  // Using PBKDF2 with crypto module (built-in to Node.js)
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, crypto.randomBytes(16).toString('hex'), 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(derivedKey.toString('hex'))
    })
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // For simplicity, using a basic comparison
  // In production, use bcrypt library
  const [hashPart, saltPart] = hash.split(':')
  if (!hashPart || !saltPart) return false
  
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, saltPart, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(derivedKey.toString('hex') === hashPart)
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
