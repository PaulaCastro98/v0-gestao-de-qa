import * as crypto from 'crypto'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${derivedKey.toString('hex')}:${salt}`)
    })
  })
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Check if it's a bcrypt hash (starts with $2b$ or $2a$)
  if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$')) {
    // For bcrypt hashes, we need to use a simple comparison
    // Since we can't use bcrypt in edge runtime, we'll use pbkdf2 going forward
    // But we need to handle legacy bcrypt hashes
    return false // Bcrypt hashes won't work with PBKDF2
  }

  // PBKDF2 hash format: "hash:salt"
  const [hash, salt] = storedHash.split(':')
  if (!hash || !salt) {
    return false
  }

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err)
      resolve(derivedKey.toString('hex') === hash)
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
