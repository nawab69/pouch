import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_KEY = '@pouch/has_wallet';
const WALLET_ADDRESS_KEY = 'pouch_wallet_address';
const WALLET_MNEMONIC_KEY = 'pouch_wallet_mnemonic';

export function useWallet() {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkWalletStatus();
  }, []);

  const checkWalletStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(WALLET_KEY);
      const hasExistingWallet = value === 'true';
      setHasWallet(hasExistingWallet);

      if (hasExistingWallet) {
        const address = await SecureStore.getItemAsync(WALLET_ADDRESS_KEY);
        setWalletAddress(address);
      }
    } catch (error) {
      console.warn('Error reading wallet status:', error);
      setHasWallet(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createWallet = useCallback(async (mnemonic: string[]) => {
    try {
      // Generate a mock wallet address from mnemonic
      // In production, this would derive the actual address using bip39/bip32
      const mockAddress = generateMockAddress(mnemonic);

      // Store mnemonic securely
      await SecureStore.setItemAsync(WALLET_MNEMONIC_KEY, mnemonic.join(' '));
      await SecureStore.setItemAsync(WALLET_ADDRESS_KEY, mockAddress);
      await AsyncStorage.setItem(WALLET_KEY, 'true');

      setWalletAddress(mockAddress);
      setHasWallet(true);
    } catch (error) {
      console.warn('Error creating wallet:', error);
      throw error;
    }
  }, []);

  const importWallet = useCallback(async (mnemonic: string[]) => {
    try {
      // Generate address from imported mnemonic
      const mockAddress = generateMockAddress(mnemonic);

      // Store mnemonic securely
      await SecureStore.setItemAsync(WALLET_MNEMONIC_KEY, mnemonic.join(' '));
      await SecureStore.setItemAsync(WALLET_ADDRESS_KEY, mockAddress);
      await AsyncStorage.setItem(WALLET_KEY, 'true');

      setWalletAddress(mockAddress);
      setHasWallet(true);
    } catch (error) {
      console.warn('Error importing wallet:', error);
      throw error;
    }
  }, []);

  const resetWallet = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(WALLET_MNEMONIC_KEY);
      await SecureStore.deleteItemAsync(WALLET_ADDRESS_KEY);
      await AsyncStorage.removeItem(WALLET_KEY);
      setHasWallet(false);
      setWalletAddress(null);
    } catch (error) {
      console.warn('Error resetting wallet:', error);
    }
  }, []);

  return {
    hasWallet,
    walletAddress,
    isLoading,
    createWallet,
    importWallet,
    resetWallet,
  };
}

// Generate a mock wallet address for demo purposes
function generateMockAddress(mnemonic: string[]): string {
  // Create a deterministic "address" from mnemonic
  // In production, use proper key derivation
  const hash = mnemonic.join('').split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);

  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hexHash}${'0'.repeat(32)}${hexHash}`;
}
