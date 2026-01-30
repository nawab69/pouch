import { useEffect, useState, useCallback, useMemo } from 'react';
import { Token, NetworkId, NetworkType } from '@/types/blockchain';
import { getTokenBalances } from '@/services/blockchain';
import { getDefaultTokens } from '@/constants/tokens';

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
  const [fetchedTokens, setFetchedTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get default tokens for this network
  const defaultTokens = useMemo(
    () => getDefaultTokens(networkId, networkType === 'testnet'),
    [networkId, networkType]
  );

  // Merge fetched tokens with default tokens
  const tokens = useMemo(() => {
    // Create a map of fetched tokens by address (lowercase for comparison)
    const fetchedMap = new Map<string, Token>();
    fetchedTokens.forEach((token) => {
      const key = token.contractAddress?.toLowerCase() ?? 'native';
      fetchedMap.set(key, token);
    });

    // Start with default tokens, replacing with fetched data if available
    const mergedTokens: Token[] = defaultTokens.map((defaultToken) => {
      const key = defaultToken.contractAddress?.toLowerCase() ?? 'native';
      const fetched = fetchedMap.get(key);

      if (fetched) {
        // Use fetched data but keep the logo from defaults if fetched doesn't have one
        return {
          ...fetched,
          logoUrl: fetched.logoUrl ?? defaultToken.logoUrl,
        };
      }

      // Return default token with 0 balance
      return defaultToken;
    });

    // Add any fetched tokens that aren't in the default list
    fetchedTokens.forEach((token) => {
      const key = token.contractAddress?.toLowerCase() ?? 'native';
      const isInDefaults = defaultTokens.some(
        (d) => (d.contractAddress?.toLowerCase() ?? 'native') === key
      );

      if (!isInDefaults && parseFloat(token.balanceFormatted) > 0) {
        mergedTokens.push(token);
      }
    });

    // Sort: native first, then by balance (descending), then alphabetically
    return mergedTokens.sort((a, b) => {
      // Native token always first
      if (a.isNative && !b.isNative) return -1;
      if (!a.isNative && b.isNative) return 1;

      // Then by balance (higher first)
      const balanceA = parseFloat(a.balanceFormatted) || 0;
      const balanceB = parseFloat(b.balanceFormatted) || 0;
      if (balanceB !== balanceA) return balanceB - balanceA;

      // Then alphabetically
      return a.symbol.localeCompare(b.symbol);
    });
  }, [fetchedTokens, defaultTokens]);

  // Calculate total balance in USD (if available)
  const totalBalanceUsd = tokens.reduce((sum, token) => {
    return sum + (token.balanceUsd ?? 0);
  }, 0);

  const fetchTokens = useCallback(async () => {
    if (!address) {
      setFetchedTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getTokenBalances(address, networkId, networkType);
      setFetchedTokens(result);
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
