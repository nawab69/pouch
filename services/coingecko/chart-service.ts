// CoinGecko chart data service with caching
import AsyncStorage from '@react-native-async-storage/async-storage';
import { coinGeckoGet, buildMarketChartEndpoint } from './coingecko-client';
import type {
  ChartTimeframe,
  ChartDataPoint,
  ChartData,
  CoinGeckoMarketChartResponse,
} from '@/types/coingecko';

const CACHE_KEY_PREFIX = 'coingecko_chart_';

// Cache TTL by timeframe (shorter timeframes need fresher data)
const CACHE_TTL_BY_TIMEFRAME: Record<ChartTimeframe, number> = {
  '1D': 5 * 60 * 1000, // 5 minutes
  '1W': 15 * 60 * 1000, // 15 minutes
  '1M': 60 * 60 * 1000, // 1 hour
  '1Y': 24 * 60 * 60 * 1000, // 24 hours
  ALL: 24 * 60 * 60 * 1000, // 24 hours
};

// API days parameter by timeframe
const DAYS_BY_TIMEFRAME: Record<ChartTimeframe, string | number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '1Y': 365,
  ALL: 'max',
};

interface CachedChart {
  data: ChartData;
  timestamp: number;
}

// In-memory cache
const memoryCache = new Map<string, CachedChart>();

function getCacheKey(coinGeckoId: string, timeframe: ChartTimeframe): string {
  return `${CACHE_KEY_PREFIX}${coinGeckoId}_${timeframe}`;
}

/**
 * Get cached chart data
 */
async function getCachedChart(
  coinGeckoId: string,
  timeframe: ChartTimeframe
): Promise<ChartData | null> {
  const key = getCacheKey(coinGeckoId, timeframe);
  const ttl = CACHE_TTL_BY_TIMEFRAME[timeframe];

  // Check memory cache first
  const memCached = memoryCache.get(key);
  if (memCached && Date.now() - memCached.timestamp < ttl) {
    return memCached.data;
  }

  // Check AsyncStorage
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const parsed: CachedChart = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < ttl) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (error) {
    console.warn('Error reading chart cache:', error);
  }

  return null;
}

/**
 * Save chart data to cache
 */
async function cacheChart(
  coinGeckoId: string,
  timeframe: ChartTimeframe,
  data: ChartData
): Promise<void> {
  const key = getCacheKey(coinGeckoId, timeframe);
  const cached: CachedChart = {
    data,
    timestamp: Date.now(),
  };

  memoryCache.set(key, cached);

  try {
    await AsyncStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.warn('Error saving chart cache:', error);
  }
}

/**
 * Process raw API response into ChartData
 */
function processChartData(
  response: CoinGeckoMarketChartResponse
): ChartData {
  const dataPoints: ChartDataPoint[] = response.prices.map(([timestamp, price]) => ({
    timestamp,
    price,
  }));

  if (dataPoints.length === 0) {
    return {
      data: [],
      minPrice: 0,
      maxPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
    };
  }

  const prices = dataPoints.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const firstPrice = dataPoints[0].price;
  const lastPrice = dataPoints[dataPoints.length - 1].price;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  return {
    data: dataPoints,
    minPrice,
    maxPrice,
    priceChange,
    priceChangePercent,
  };
}

/**
 * Fetch chart data for a token
 */
export async function getChartData(
  coinGeckoId: string,
  timeframe: ChartTimeframe
): Promise<ChartData> {
  // Check cache first
  const cached = await getCachedChart(coinGeckoId, timeframe);
  if (cached) {
    return cached;
  }

  // Fetch from API
  try {
    const days = DAYS_BY_TIMEFRAME[timeframe];
    const endpoint = buildMarketChartEndpoint(coinGeckoId, days);
    const response = await coinGeckoGet<CoinGeckoMarketChartResponse>(endpoint);

    const chartData = processChartData(response);
    await cacheChart(coinGeckoId, timeframe, chartData);

    return chartData;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    // Return empty data on error
    return {
      data: [],
      minPrice: 0,
      maxPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
    };
  }
}

/**
 * Clear chart cache for a specific token or all tokens
 */
export async function clearChartCache(coinGeckoId?: string): Promise<void> {
  if (coinGeckoId) {
    // Clear specific token
    for (const timeframe of ['1D', '1W', '1M', '1Y', 'ALL'] as ChartTimeframe[]) {
      const key = getCacheKey(coinGeckoId, timeframe);
      memoryCache.delete(key);
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.warn('Error clearing chart cache:', error);
      }
    }
  } else {
    // Clear all
    for (const key of memoryCache.keys()) {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        memoryCache.delete(key);
      }
    }

    try {
      const keys = await AsyncStorage.getAllKeys();
      const chartKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(chartKeys);
    } catch (error) {
      console.warn('Error clearing chart cache:', error);
    }
  }
}
