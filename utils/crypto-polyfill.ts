import * as ExpoCrypto from 'expo-crypto';

// Polyfill crypto.getRandomValues for React Native
// Required by @scure/bip39 for secure mnemonic generation
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {};
}

if (typeof global.crypto.getRandomValues === 'undefined') {
  global.crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
    if (array === null) return array;

    const bytes = ExpoCrypto.getRandomBytes(array.byteLength);
    const uint8Array = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    uint8Array.set(bytes);

    return array;
  };
}
