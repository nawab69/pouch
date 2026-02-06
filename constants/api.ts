// API Configuration

// Cache server URL - update this to your machine's LAN IP for physical device testing
export const CACHE_SERVER_URL = __DEV__
  ? 'http://192.168.10.109:3001'
  : 'https://your-cache-server.com'; // Production URL
