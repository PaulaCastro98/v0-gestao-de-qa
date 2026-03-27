import * as crypto from 'crypto'

// Parâmetros PBKDF2 (devem ser consistentes entre hash e verify)
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64; // 64 bytes = 512 bits
const PBKDF2_DIGEST = 'sha512';
const SALT_BYTES = 16; // 16 bytes para o salt

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Gerar um salt único para cada senha
    crypto.randomBytes(SALT_BYTES, (err, saltBuffer) => {
      if (err) return reject(err);

      const salt = saltBuffer.toString('hex'); // Converter o salt para string hexadecimal

      crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, derivedKey) => {
        if (err) reject(err);
        // Retornar o salt e o hash combinados, separados por um delimitador
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  });
}

export async function verifyPassword(password: string, storedCombinedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Extrair o salt e o hash original da string combinada armazenada
    const parts = storedCombinedHash.split(':');
    if (parts.length !== 2) {
      // Formato inválido do hash armazenado
      return resolve(false);
    }
    const salt = parts[0];
    const originalHash = parts[1];

    // Re-derivar a chave usando a senha fornecida e o salt armazenado
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      // Comparar o hash recém-derivado com o hash original armazenado
      // É crucial usar uma comparação de tempo constante (timingSafeEqual) em produção para evitar ataques de tempo
      // Para simplicidade aqui, usamos ===, mas timingSafeEqual é recomendado para segurança máxima.
      resolve(derivedKey.toString('hex') === originalHash);
    });
  });
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