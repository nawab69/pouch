import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deriveWalletFromMnemonic } from '@/services/blockchain';

const WALLET_KEY = '@pouch/has_wallet';
const WALLET_ADDRESS_KEY = 'pouch_wallet_address';
const WALLET_MNEMONIC_KEY = 'pouch_wallet_mnemonic';
const WALLET_PRIVATE_KEY = 'pouch_wallet_private_key';

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
      const phrase = mnemonic.join(' ');

      // Derive wallet using ethers.js BIP44 derivation
      const derivedWallet = deriveWalletFromMnemonic(phrase);

      // Store mnemonic securely
      await SecureStore.setItemAsync(WALLET_MNEMONIC_KEY, phrase);
      // Store address
      await SecureStore.setItemAsync(WALLET_ADDRESS_KEY, derivedWallet.address);
      // Store private key for transaction signing
      await SecureStore.setItemAsync(WALLET_PRIVATE_KEY, derivedWallet.privateKey);
      // Mark wallet as created
      await AsyncStorage.setItem(WALLET_KEY, 'true');

      setWalletAddress(derivedWallet.address);
      setHasWallet(true);
    } catch (error) {
      console.warn('Error creating wallet:', error);
      throw error;
    }
  }, []);

  const importWallet = useCallback(async (mnemonic: string[]) => {
    try {
      const phrase = mnemonic.join(' ');

      // Derive wallet using ethers.js BIP44 derivation
      const derivedWallet = deriveWalletFromMnemonic(phrase);

      // Store mnemonic securely
      await SecureStore.setItemAsync(WALLET_MNEMONIC_KEY, phrase);
      // Store address
      await SecureStore.setItemAsync(WALLET_ADDRESS_KEY, derivedWallet.address);
      // Store private key for transaction signing
      await SecureStore.setItemAsync(WALLET_PRIVATE_KEY, derivedWallet.privateKey);
      // Mark wallet as created
      await AsyncStorage.setItem(WALLET_KEY, 'true');

      setWalletAddress(derivedWallet.address);
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
      await SecureStore.deleteItemAsync(WALLET_PRIVATE_KEY);
      await AsyncStorage.removeItem(WALLET_KEY);
      setHasWallet(false);
      setWalletAddress(null);
    } catch (error) {
      console.warn('Error resetting wallet:', error);
    }
  }, []);

  /**
   * Get the private key for transaction signing
   * This should only be called when needed for signing
   */
  const getPrivateKey = useCallback(async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(WALLET_PRIVATE_KEY);
    } catch (error) {
      console.warn('Error getting private key:', error);
      return null;
    }
  }, []);

  /**
   * Get the mnemonic phrase
   * This should only be called when user explicitly requests to view it
   */
  const getMnemonic = useCallback(async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(WALLET_MNEMONIC_KEY);
    } catch (error) {
      console.warn('Error getting mnemonic:', error);
      return null;
    }
  }, []);

  return {
    hasWallet,
    walletAddress,
    isLoading,
    createWallet,
    importWallet,
    resetWallet,
    getPrivateKey,
    getMnemonic,
  };
}
