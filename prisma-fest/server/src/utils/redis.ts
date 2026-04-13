/**
 * Redis client — with full in-memory fallback for local dev (no Redis required).
 */

import { logger } from './logger';

// ─── In-memory fallback store ─────────────────────────────────────
const memStore: Record<string, { value: string; exp: number | null }> = {};
let liveCount = 0;
let redisClient: any = null;
let usingFallback = true;

function memGet(key: string): string | null {
  const entry = memStore[key];
  if (!entry) return null;
  if (entry.exp && Date.now() > entry.exp) { delete memStore[key]; return null; }
  return entry.value;
}
function memSet(key: string, value: string, ttlMs?: number) {
  memStore[key] = { value, exp: ttlMs ? Date.now() + ttlMs : null };
}
function memDel(key: string) { delete memStore[key]; }

// ─── Connect (tries Redis, falls back silently) ───────────────────
export async function connectRedis(): Promise<void> {
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    logger.warn('⚠️  No REDIS_URL set — using in-memory fallback (dev mode)');
    return;
  }
  try {
    const { default: Redis } = await import('ioredis');
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
    });
    await redisClient.connect();
    usingFallback = false;
    logger.info('✅ Connected to Redis');
  } catch (err) {
    logger.warn('⚠️  Redis unavailable — using in-memory fallback');
    redisClient = null;
    usingFallback = true;
  }
}

// ─── Cache helpers ────────────────────────────────────────────────
export async function cacheSet(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
  try {
    const str = JSON.stringify(value);
    if (!usingFallback && redisClient) {
      await redisClient.setex(key, ttlSeconds, str);
    } else {
      memSet(key, str, ttlSeconds * 1000);
    }
  } catch { /* silent */ }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = (!usingFallback && redisClient) ? await redisClient.get(key) : memGet(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    if (!usingFallback && redisClient) { await redisClient.del(key); }
    else { memDel(key); }
  } catch { /* silent */ }
}

// ─── Refresh token store ──────────────────────────────────────────
export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  await cacheSet(`refresh:${userId}`, token, 7 * 24 * 3600);
}

export async function getStoredRefreshToken(userId: string): Promise<string | null> {
  return cacheGet<string>(`refresh:${userId}`);
}

export async function invalidateRefreshToken(userId: string): Promise<void> {
  await cacheDel(`refresh:${userId}`);
}

// ─── Live visitor count ───────────────────────────────────────────
export async function incrementLiveCount(): Promise<number> {
  if (!usingFallback && redisClient) return redisClient.incr('live:visitors');
  return ++liveCount;
}

export async function decrementLiveCount(): Promise<number> {
  if (!usingFallback && redisClient) {
    const c = await redisClient.decr('live:visitors');
    if (c < 0) { await redisClient.set('live:visitors', '0'); return 0; }
    return c;
  }
  if (liveCount > 0) liveCount--;
  return liveCount;
}

export async function getLiveCount(): Promise<number> {
  if (!usingFallback && redisClient) {
    const c = await redisClient.get('live:visitors');
    return parseInt(c || '0', 10);
  }
  return liveCount;
}

export function getRedis() { return redisClient; }
