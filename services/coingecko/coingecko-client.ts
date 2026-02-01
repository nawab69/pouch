// CoinGecko API client with rate limiting

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Rate limiting: CoinGecko free tier allows ~10-30 calls/minute
const RATE_LIMIT_CALLS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

interface RateLimitState {
  calls: number[];
}

const rateLimitState: RateLimitState = {
  calls: [],
};

function cleanupOldCalls(): void {
  const now = Date.now();
  rateLimitState.calls = rateLimitState.calls.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
}

async function waitForRateLimit(): Promise<void> {
  cleanupOldCalls();

  if (rateLimitState.calls.length >= RATE_LIMIT_CALLS) {
    const oldestCall = rateLimitState.calls[0];
    const waitTime = RATE_LIMIT_WINDOW_MS - (Date.now() - oldestCall) + 100;

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      cleanupOldCalls();
    }
  }
}

function recordCall(): void {
  rateLimitState.calls.push(Date.now());
}

async function fetchWithBackoff<T>(
  url: string,
  retries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await waitForRateLimit();
      recordCall();

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 429) {
        // Rate limited - wait with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`CoinGecko rate limited, waiting ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

export async function coinGeckoGet<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  return fetchWithBackoff<T>(url);
}

export function buildPriceEndpoint(
  ids: string[],
  options: {
    include24hChange?: boolean;
    includeVolume?: boolean;
    includeMarketCap?: boolean;
  } = {}
): string {
  const params = new URLSearchParams({
    ids: ids.join(','),
    vs_currencies: 'usd',
  });

  if (options.include24hChange) {
    params.append('include_24hr_change', 'true');
  }
  if (options.includeVolume) {
    params.append('include_24hr_vol', 'true');
  }
  if (options.includeMarketCap) {
    params.append('include_market_cap', 'true');
  }

  return `/simple/price?${params.toString()}`;
}

export function buildMarketChartEndpoint(
  id: string,
  days: string | number
): string {
  return `/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
}
