import { useMemo } from 'react';
import { Token } from '@/types/blockchain';
import { getTokenColor, OTHER_COLOR } from '@/constants/token-colors';

export interface TokenAllocation {
  token: Token;
  percentage: number;
  color: string;
  usdValue: number;
}

export interface PortfolioMetrics {
  allocations: TokenAllocation[];
  topHolding: Token | null;
  diversificationScore: number; // 0-100
  totalValue: number;
}

interface UsePortfolioMetricsOptions {
  tokens: Token[];
  totalBalanceUsd: number;
  groupSmallHoldings?: boolean;
  smallHoldingThreshold?: number; // Percentage threshold for grouping
}

export function usePortfolioMetrics({
  tokens,
  totalBalanceUsd,
  groupSmallHoldings = true,
  smallHoldingThreshold = 2, // Group holdings under 2%
}: UsePortfolioMetricsOptions): PortfolioMetrics {
  return useMemo(() => {
    if (totalBalanceUsd === 0 || tokens.length === 0) {
      return {
        allocations: [],
        topHolding: null,
        diversificationScore: 0,
        totalValue: 0,
      };
    }

    // Calculate allocations for all tokens with USD value
    const rawAllocations: TokenAllocation[] = tokens
      .filter((token) => token.balanceUsd && token.balanceUsd > 0)
      .map((token) => ({
        token,
        percentage: ((token.balanceUsd ?? 0) / totalBalanceUsd) * 100,
        color: getTokenColor(token.symbol),
        usdValue: token.balanceUsd ?? 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    let allocations = rawAllocations;

    // Group small holdings into "Other" category if enabled
    if (groupSmallHoldings && rawAllocations.length > 5) {
      const significantAllocations: TokenAllocation[] = [];
      let otherPercentage = 0;
      let otherValue = 0;

      for (const allocation of rawAllocations) {
        if (allocation.percentage >= smallHoldingThreshold) {
          significantAllocations.push(allocation);
        } else {
          otherPercentage += allocation.percentage;
          otherValue += allocation.usdValue;
        }
      }

      // Add "Other" category if there are grouped holdings
      if (otherPercentage > 0) {
        const otherToken: Token = {
          contractAddress: 'other',
          symbol: 'OTHER',
          name: 'Other',
          decimals: 0,
          balance: '0',
          balanceFormatted: '0',
          balanceUsd: otherValue,
          isNative: false,
        };

        significantAllocations.push({
          token: otherToken,
          percentage: otherPercentage,
          color: OTHER_COLOR,
          usdValue: otherValue,
        });
      }

      allocations = significantAllocations;
    }

    // Find top holding
    const topHolding = rawAllocations.length > 0 ? rawAllocations[0].token : null;

    // Calculate diversification score (Herfindahl-Hirschman Index inverted)
    // Score of 100 = perfectly diversified, 0 = all in one asset
    const hhi = rawAllocations.reduce((sum, a) => sum + Math.pow(a.percentage / 100, 2), 0);
    // Normalize HHI to 0-100 scale (HHI of 1 = concentrated, HHI of 1/n = diversified)
    const n = rawAllocations.length;
    const minHHI = n > 0 ? 1 / n : 1;
    const diversificationScore = n > 1
      ? Math.round(((1 - hhi) / (1 - minHHI)) * 100)
      : 0;

    return {
      allocations,
      topHolding,
      diversificationScore: Math.max(0, Math.min(100, diversificationScore)),
      totalValue: totalBalanceUsd,
    };
  }, [tokens, totalBalanceUsd, groupSmallHoldings, smallHoldingThreshold]);
}
