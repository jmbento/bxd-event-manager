/**
 * BXD Event Manager - Serviço de Criptografia
 * Para dados sensíveis (CPF, telefone, etc) - LGPD Compliance
 */

const crypto = require('crypto');

// Algoritmo de criptografia
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Chave de criptografia (DEVE vir do ambiente)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    console.warn('⚠️ ENCRYPTION_KEY não definida! Usando chave temporária (NÃO USE EM PRODUÇÃO)');
    // Gera uma chave determinística para desenvolvimento (NÃO SEGURO)
    return crypto.scryptSync('dev-temp-key', 'bxd-salt', 32);
  }
  
  // Se a chave tiver 64 caracteres, é hex
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // Senão, derivar usando scrypt
  return crypto.scryptSync(key, 'bxd-encryption-salt', 32);
};

/**
 * Criptografa um texto
 * @param {string} plaintext - Texto a ser criptografado
 * @returns {string} - Texto criptografado em formato: iv:authTag:ciphertext (base64)
 */
function encrypt(plaintext) {
  if (!plaintext) return null;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Formato: iv:authTag:ciphertext (tudo em base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('Erro ao criptografar:', error.message);
    throw new Error('Falha na criptografia');
  }
}

/**
 * Descriptografa um texto
 * @param {string} encryptedText - Texto no formato iv:authTag:ciphertext
 * @returns {string} - Texto original
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      // Pode ser texto não criptografado (migração)
      return encryptedText;
    }
    
    const [ivBase64, authTagBase64, ciphertext] = parts;
    
    const key = getEncryptionKey();
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar:', error.message);
    // Retorna o texto original se falhar (pode ser texto não criptografado)
    return encryptedText;
  }
}

/**
 * Hash de senha com salt
 * @param {string} password - Senha em texto plano
 * @returns {string} - Hash no formato salt:hash
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica senha contra hash
 * @param {string} password - Senha a verificar
 * @param {string} storedHash - Hash armazenado (salt:hash)
 * @returns {boolean}
 */
function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(':');
    const hashToVerify = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashToVerify, 'hex'));
  } catch (error) {
    return false;
  }
}

/**
 * Máscara de CPF para exibição
 * @param {string} cpf - CPF completo
 * @returns {string} - CPF mascarado: ***.***.***-XX
 */
function maskCPF(cpf) {
  if (!cpf || cpf.length < 11) return '***.***.***-**';
  const clean = cpf.replace(/\D/g, '');
  return `***.***.***.${clean.slice(-2)}`;
}

/**
 * Máscara de telefone para exibição
 * @param {string} phone - Telefone completo
 * @returns {string} - Telefone mascarado: (**) *****-XXXX
 */
function maskPhone(phone) {
  if (!phone) return '(**) *****-****';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 4) {
    return `(**) *****-${clean.slice(-4)}`;
  }
  return '(**) *****-****';
}

/**
 * Máscara de email para exibição
 * @param {string} email - Email completo
 * @returns {string} - Email mascarado: j***@gmail.com
 */
function maskEmail(email) {
  if (!email) return '***@***.***';
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.***';
  const maskedLocal = local.charAt(0) + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Gera token seguro para reset de senha, etc
 * @param {number} length - Tamanho em bytes (default 32)
 * @returns {string} - Token em hex
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash simples para comparação (não para senhas)
 * @param {string} data 
 * @returns {string}
 */
function quickHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// =============================================================================
// HELPERS PARA MODELO
// =============================================================================

/**
 * Criptografa campos sensíveis de um objeto
 * @param {object} data - Objeto com dados
 * @param {string[]} fields - Campos a criptografar
 * @returns {object} - Objeto com campos criptografados
 */
function encryptFields(data, fields = ['cpf', 'phone', 'document_number']) {
  const result = { ...data };
  
  for (const field of fields) {
    if (result[field]) {
      result[field] = encrypt(result[field]);
    }
  }
  
  return result;
}

/**
 * Descriptografa campos sensíveis de um objeto
 * @param {object} data - Objeto com dados criptografados
 * @param {string[]} fields - Campos a descriptografar
 * @returns {object} - Objeto com campos em texto plano
 */
function decryptFields(data, fields = ['cpf', 'phone', 'document_number']) {
  const result = { ...data };
  
  for (const field of fields) {
    if (result[field]) {
      result[field] = decrypt(result[field]);
    }
  }
  
  return result;
}

// =============================================================================
// EXPORTAR
// =============================================================================

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  maskCPF,
  maskPhone,
  maskEmail,
  generateSecureToken,
  quickHash,
  encryptFields,
  decryptFields
};
