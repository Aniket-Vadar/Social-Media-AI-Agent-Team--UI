/**
 * Enterprise Edge Rate Limiter & IP Anti-Spam Protection
 * Supports Upstash Redis REST API natively using Web Fetch (zero Node.js dependencies)
 * with robust in-memory sliding window fallback for local development.
 */

const memoryCache = new Map<string, { count: number; expiresAt: number }>();
const bannedIps = new Set<string>();
const strikesMap = new Map<string, number>();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedis = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

export interface RateLimitResult {
  success: boolean;
  isBanned: boolean;
  remaining: number;
  limit: number;
  reset: number;
}

/**
 * Execute command on Upstash Redis via native Edge Fetch
 */
async function redisCommand<T = any>(command: string, ...args: (string | number)[]): Promise<T | null> {
  if (!hasRedis || !UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/${[command, ...args].join('/')}`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch (err) {
    return null;
  }
}

/**
 * Check if IP is banned or rate-limited
 */
export async function checkRateLimit(ip: string, isStrict = false): Promise<RateLimitResult> {
  const now = Date.now();
  const windowSeconds = 60;
  const maxRequests = isStrict ? 15 : 90;

  // 1. Check if IP is in the banned list
  if (hasRedis) {
    const bannedReason = await redisCommand<string>('get', `banned:ip:${ip}`);
    if (bannedReason) {
      return { success: false, isBanned: true, remaining: 0, limit: 0, reset: 0 };
    }
  } else if (bannedIps.has(ip)) {
    return { success: false, isBanned: true, remaining: 0, limit: 0, reset: 0 };
  }

  // 2. Sliding window rate limit check via Upstash REST
  if (hasRedis) {
    const key = `ratelimit:${ip}:${isStrict ? 'strict' : 'std'}`;
    const count = await redisCommand<number>('incr', key);

    if (count === 1) {
      await redisCommand('expire', key, windowSeconds);
    }

    if (count !== null && count > maxRequests) {
      // Record strike for spamming
      await recordAbuseStrike(ip);
      return {
        success: false,
        isBanned: false,
        remaining: 0,
        limit: maxRequests,
        reset: now + windowSeconds * 1000,
      };
    }

    return {
      success: true,
      isBanned: false,
      remaining: Math.max(0, maxRequests - (count || 1)),
      limit: maxRequests,
      reset: now + windowSeconds * 1000,
    };
  }

  // 3. In-memory sliding window fallback
  const memKey = `ratelimit:${ip}:${isStrict ? 'strict' : 'std'}`;
  const record = memoryCache.get(memKey);

  if (!record || now > record.expiresAt) {
    memoryCache.set(memKey, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return {
      success: true,
      isBanned: false,
      remaining: maxRequests - 1,
      limit: maxRequests,
      reset: now + windowSeconds * 1000,
    };
  }

  record.count += 1;
  if (record.count > maxRequests) {
    recordAbuseStrikeSync(ip);
    return {
      success: false,
      isBanned: false,
      remaining: 0,
      limit: maxRequests,
      reset: record.expiresAt,
    };
  }

  return {
    success: true,
    isBanned: false,
    remaining: Math.max(0, maxRequests - record.count),
    limit: maxRequests,
    reset: record.expiresAt,
  };
}

/**
 * Record rate limit violation strikes; ban IP for 24h if >= 5 violations
 */
async function recordAbuseStrike(ip: string) {
  if (!hasRedis) return;
  const strikesKey = `strikes:ip:${ip}`;
  const strikes = await redisCommand<number>('incr', strikesKey);
  if (strikes === 1) {
    await redisCommand('expire', strikesKey, 3600); // 1 hour window
  }

  if (strikes && strikes >= 5) {
    // 5 strikes = Ban IP for 24 hours (86400 seconds)
    await redisCommand('set', `banned:ip:${ip}`, 'spam_protection', 'EX', 86400);
  }
}

function recordAbuseStrikeSync(ip: string) {
  const current = (strikesMap.get(ip) || 0) + 1;
  strikesMap.set(ip, current);

  if (current >= 5) {
    bannedIps.add(ip);
    setTimeout(() => {
      bannedIps.delete(ip);
      strikesMap.delete(ip);
    }, 86400 * 1000);
  }
}
