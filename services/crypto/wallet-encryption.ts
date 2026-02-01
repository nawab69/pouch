import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_SALT_KEY = 'pouch_encryption_salt';
const KEY_DERIVATION_ITERATIONS = 100;

/**
 * Generate a random salt for encryption key derivation
 */
export async function generateSalt(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(new Uint8Array(randomBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Get or create the encryption salt
 * This salt is separate from the PIN verification salt
 */
export async function getOrCreateEncryptionSalt(): Promise<string> {
  let salt = await SecureStore.getItemAsync(ENCRYPTION_SALT_KEY);
  if (!salt) {
    salt = await generateSalt();
    await SecureStore.setItemAsync(ENCRYPTION_SALT_KEY, salt);
  }
  return salt;
}

/**
 * Derive an encryption key from PIN using iterative SHA-256
 * Uses 100 iterations for security while remaining performant on mobile
 */
export async function deriveKeyFromPin(pin: string, salt: string): Promise<string> {
  let hash = `${salt}:${pin}`;

  for (let i = 0; i < KEY_DERIVATION_ITERATIONS; i++) {
    hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      hash
    );
  }

  return hash;
}

/**
 * Encrypt data using AES-256
 */
export function encryptData(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * Decrypt data using AES-256
 * Returns null if decryption fails (wrong key)
 */
export function decryptData(encrypted: string, key: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // If decryption produces empty string or fails, return null
    if (!decrypted) {
      return null;
    }

    return decrypted;
  } catch {
    return null;
  }
}

/**
 * Encrypt wallet mnemonic with PIN
 */
export async function encryptMnemonic(mnemonic: string, pin: string): Promise<string> {
  const salt = await getOrCreateEncryptionSalt();
  const key = await deriveKeyFromPin(pin, salt);
  return encryptData(mnemonic, key);
}

/**
 * Decrypt wallet mnemonic with PIN
 */
export async function decryptMnemonic(encryptedMnemonic: string, pin: string): Promise<string | null> {
  const salt = await SecureStore.getItemAsync(ENCRYPTION_SALT_KEY);
  if (!salt) {
    return null;
  }

  const key = await deriveKeyFromPin(pin, salt);
  return decryptData(encryptedMnemonic, key);
}

/**
 * Encrypt private key with PIN
 */
export async function encryptPrivateKey(privateKey: string, pin: string): Promise<string> {
  const salt = await getOrCreateEncryptionSalt();
  const key = await deriveKeyFromPin(pin, salt);
  return encryptData(privateKey, key);
}

/**
 * Decrypt private key with PIN
 */
export async function decryptPrivateKey(encryptedPrivateKey: string, pin: string): Promise<string | null> {
  const salt = await SecureStore.getItemAsync(ENCRYPTION_SALT_KEY);
  if (!salt) {
    return null;
  }

  const key = await deriveKeyFromPin(pin, salt);
  return decryptData(encryptedPrivateKey, key);
}

/**
 * Delete the encryption salt (for wallet reset)
 */
export async function deleteEncryptionSalt(): Promise<void> {
  await SecureStore.deleteItemAsync(ENCRYPTION_SALT_KEY);
}
