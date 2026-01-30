import { useEffect, useState, useCallback } from 'react';
import { Token, NetworkId, NetworkType } from '@/types/blockchain';
import { getTokenBalances } from '@/services/blockchain';

interface UseTokensOptions {
  address: string | null;
  networkId: NetworkId;
  networkType: NetworkType;
  autoFetch?: boolean;
}

export function useTokens({
  address,
  networkId,
  networkType,
  autoFetch = true,
}: UseTokensOptions) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Calculate total balance in USD (if available)
  const totalBalanceUsd = tokens.reduce((sum, token) => {
    return sum + (token.balanceUsd ?? 0);
  }, 0);

  const fetchTokens = useCallback(async () => {
    if (!address) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedTokens = await getTokenBalances(address, networkId, networkType);
      setTokens(fetchedTokens);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load token balances');
    } finally {
      setIsLoading(false);
    }
  }, [address, networkId, networkType]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && address) {
      fetchTokens();
    }
  }, [fetchTokens, autoFetch, address]);

  // Get a specific token by contract address (null for native)
  const getToken = useCallback(
    (contractAddress: string | null): Token | undefined => {
      return tokens.find((t) =>
        contractAddress === null
          ? t.isNative
          : t.contractAddress?.toLowerCase() === contractAddress.toLowerCase()
      );
    },
    [tokens]
  );

  // Get native token
  const nativeToken = tokens.find((t) => t.isNative) ?? null;

  return {
    tokens,
    nativeToken,
    totalBalanceUsd,
    isLoading,
    error,
    lastUpdated,
    refreshTokens: fetchTokens,
    getToken,
  };
}
