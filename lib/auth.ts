// lib/auth.ts
import * as crypto from 'crypto'
import jwt from 'jsonwebtoken' // ADICIONADO: Importação do jsonwebtoken

// Parâmetros PBKDF2 (devem ser consistentes entre hash e verify)
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64; // 64 bytes = 512 bits
const PBKDF2_DIGEST = 'sha512';
const SALT_BYTES = 16; // 16 bytes para o salt

// O segredo do JWT deve ser uma variável de ambiente forte e única
// ATENÇÃO: Em produção, NUNCA use um valor padrão como este.
// Use process.env.JWT_SECRET e garanta que ele esteja definido no seu ambiente.
const JWT_SECRET = process.env.JWT_SECRET || 'um_segredo_muito_forte_e_unico_para_jwt_em_producao_mude_isso';

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Gerar o salt com o tamanho definido
    const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, derivedKey) => {
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
    crypto.pbkdf2(password, storedSalt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST, (err, derivedKey) => {
      if (err) reject(err)
      // Usar timingSafeEqual para comparação segura contra ataques de tempo
      const newHashBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
      const storedHashBuffer = Buffer.from(storedHash, 'hex');

      // Comparar buffers de forma segura
      if (newHashBuffer.length !== storedHashBuffer.length) {
        resolve(false); // Tamanhos diferentes, hashes diferentes
      }
      resolve(crypto.timingSafeEqual(newHashBuffer, storedHashBuffer));
    })
  })
}

// MODIFICADO: Aceita userId e usa jsonwebtoken
export function generateSessionToken(userId: string): string {
  // O token agora incluirá o ID do usuário no payload
  const token = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '7d' }) // Expira em 7 dias
  return token
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

// ADICIONADO: Função para verificar e decodificar o token JWT
export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token JWT:', error);
    return null;
  }
}