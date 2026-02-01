import { useState, useEffect, useCallback, useMemo } from 'react';
import { Token, NetworkId, NetworkType, Transaction } from '@/types/blockchain';
import { getTransactionHistory } from '@/services/blockchain';

interface UseTokenTransactionsOptions {
  address: string | null;
  token: Token | null;
  networkId: NetworkId;
  networkType: NetworkType;
  limit?: number;
}

interface UseTokenTransactionsResult {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTokenTransactions({
  address,
  token,
  networkId,
  networkType,
  limit = 10,
}: UseTokenTransactionsOptions): UseTokenTransactionsResult {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!address) {
      setAllTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const history = await getTransactionHistory(address, networkId, networkType);
      setAllTransactions(history);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [address, networkId, networkType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions for the specific token
  const transactions = useMemo(() => {
    if (!token || allTransactions.length === 0) {
      return [];
    }

    const filtered = allTransactions.filter((tx) => {
      if (token.isNative) {
        // For native tokens, only show transactions where the tx token is also native
        return tx.token?.isNative === true;
      } else {
        // For ERC20 tokens, filter by contract address
        return (
          tx.token?.contractAddress?.toLowerCase() ===
          token.contractAddress?.toLowerCase()
        );
      }
    });

    return filtered.slice(0, limit);
  }, [token, allTransactions, limit]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
