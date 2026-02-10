import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // bytes — recommended for GCM
const AUTH_TAG_LENGTH = 16; // bytes

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;

  if (!hex) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  if (hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)',
    );
  }

  return Buffer.from(hex, 'hex');
}

/**
 * Encrypts a plain text string using AES-256-GCM.
 * Returns a string in the format: "iv:authTag:ciphertext" (all hex-encoded).
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

/**
 * Decrypts a string previously encrypted with {@link encrypt}.
 * Expects the format: "iv:authTag:ciphertext" (all hex-encoded).
 */
export function decrypt(data: string): string {
  const key = getKey();
  const parts = data.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, 'hex'),
    { authTagLength: AUTH_TAG_LENGTH },
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  return (
    decipher.update(Buffer.from(encryptedHex, 'hex')).toString('utf8') +
    decipher.final('utf8')
  );
}

/**
 * Returns true if the string looks like an encrypted value (iv:authTag:ciphertext).
 * Used in hooks to avoid double-encrypting on findOneAndUpdate.
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3 && parts.every((p) => /^[0-9a-f]+$/i.test(p));
}
