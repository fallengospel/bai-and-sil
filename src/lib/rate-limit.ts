const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
};

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },    // 10 attempts per 15 min
  api: { windowMs: 60 * 1000, maxRequests: 60 },           // 60 requests per min
  upload: { windowMs: 60 * 1000, maxRequests: 10 },        // 10 uploads per min
  search: { windowMs: 60 * 1000, maxRequests: 30 },        // 30 searches per min
};

function getRateLimitKey(identifier: string, route: string): string {
  return `${identifier}:${route}`;
}

function getRouteCategory(pathname: string): string {
  if (pathname.startsWith('/api/auth')) return 'auth';
  if (pathname.startsWith('/api/upload')) return 'upload';
  if (pathname.startsWith('/api/searches') || pathname.startsWith('/api/listings')) return 'search';
  return 'api';
}

export function checkRateLimit(
  identifier: string,
  pathname: string
): { allowed: boolean; remaining: number; resetTime: number } {
  const route = getRouteCategory(pathname);
  const config = RATE_LIMIT_CONFIGS[route] || DEFAULT_CONFIG;
  const key = getRateLimitKey(identifier, route);
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}
