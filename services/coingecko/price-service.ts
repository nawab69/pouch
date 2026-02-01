// CoinGecko price fetching service with caching
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  coinGeckoGet,
  buildPriceEndpoint,
} from './coingecko-client';
import type {
  TokenPriceData,
  CoinGeckoPriceResponse,
} from '@/types/coingecko';

const CACHE_KEY_PREFIX = 'coingecko_price_';
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

interface CachedPrice {
  data: TokenPriceData;
  timestamp: number;
}

// In-memory cache for faster access
const memoryCache = new Map<string, CachedPrice>();

/**
 * Get cached price data (checks memory first, then AsyncStorage)
 */
async function getCachedPrice(coinGeckoId: string): Promise<TokenPriceData | null> {
  // Check memory cache first
  const memCached = memoryCache.get(coinGeckoId);
  if (memCached && Date.now() - memCached.timestamp < CACHE_TTL_MS) {
    return memCached.data;
  }

  // Check AsyncStorage
  try {
    const stored = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${coinGeckoId}`);
    if (stored) {
      const parsed: CachedPrice = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        // Update memory cache
        memoryCache.set(coinGeckoId, parsed);
        return parsed.data;
      }
    }
  } catch (error) {
    console.warn('Error reading price cache:', error);
  }

  return null;
}

/**
 * Save price data to cache
 */
async function cachePrice(coinGeckoId: string, data: TokenPriceData): Promise<void> {
  const cached: CachedPrice = {
    data,
    timestamp: Date.now(),
  };

  // Save to memory cache
  memoryCache.set(coinGeckoId, cached);

  // Save to AsyncStorage
  try {
    await AsyncStorage.setItem(
      `${CACHE_KEY_PREFIX}${coinGeckoId}`,
      JSON.stringify(cached)
    );
  } catch (error) {
    console.warn('Error saving price cache:', error);
  }
}

/**
 * Fetch current prices for multiple tokens
 * Returns a map of coinGeckoId -> TokenPriceData
 */
export async function getTokenPrices(
  coinGeckoIds: string[]
): Promise<Map<string, TokenPriceData>> {
  const result = new Map<string, TokenPriceData>();
  const idsToFetch: string[] = [];

  // Check cache for each ID
  for (const id of coinGeckoIds) {
    const cached = await getCachedPrice(id);
    if (cached) {
      result.set(id, cached);
    } else {
      idsToFetch.push(id);
    }
  }

  // If all prices are cached, return early
  if (idsToFetch.length === 0) {
    return result;
  }

  // Fetch remaining prices from API
  try {
    const endpoint = buildPriceEndpoint(idsToFetch, {
      include24hChange: true,
      includeVolume: true,
      includeMarketCap: true,
    });

    const response = await coinGeckoGet<CoinGeckoPriceResponse>(endpoint);

    // Process and cache each price
    for (const id of idsToFetch) {
      const priceData = response[id];
      if (priceData) {
        const tokenPriceData: TokenPriceData = {
          coinGeckoId: id,
          priceUsd: priceData.usd,
          change24h: priceData.usd_24h_change ?? 0,
          volume24h: priceData.usd_24h_vol ?? 0,
          marketCap: priceData.usd_market_cap ?? 0,
          lastUpdated: Date.now(),
        };

        result.set(id, tokenPriceData);
        await cachePrice(id, tokenPriceData);
      }
    }
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
    // Return partial results from cache
  }

  return result;
}

/**
 * Fetch current price for a single token
 */
export async function getTokenPrice(
  coinGeckoId: string
): Promise<TokenPriceData | null> {
  const prices = await getTokenPrices([coinGeckoId]);
  return prices.get(coinGeckoId) ?? null;
}

/**
 * Clear price cache (useful for force refresh)
 */
export async function clearPriceCache(): Promise<void> {
  memoryCache.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const priceKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(priceKeys);
  } catch (error) {
    console.warn('Error clearing price cache:', error);
  }
}
