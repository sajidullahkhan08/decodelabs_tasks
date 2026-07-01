/**
 * PROJECT 4: Third-Party API Integration
 * In-memory cache with TTL for weather API responses.
 */
class MemoryCache {
  constructor(defaultTtl = 300000) {
    this.store = new Map();
    this.defaultTtl = defaultTtl;
  }

  generateKey(prefix, params = {}) {
    const sorted = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    return `${prefix}:${sorted}`;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key, data, ttl = this.defaultTtl) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

const cacheTtl = parseInt(process.env.CACHE_TTL, 10) || 300000;
const weatherCache = new MemoryCache(cacheTtl);

const cacheMiddleware = (prefix) => (req, res, next) => {
  const params = { ...req.query, ...req.body };
  const key = weatherCache.generateKey(prefix, params);
  const cached = weatherCache.get(key);

  if (cached) {
    return res.status(200).json({
      success: true,
      cached: true,
      data: cached,
    });
  }

  req.cacheKey = key;
  next();
};

module.exports = { MemoryCache, weatherCache, cacheMiddleware };
