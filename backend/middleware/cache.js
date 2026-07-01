/**
 * In-memory cache with TTL support for weather API responses.
 */
class MemoryCache {
  constructor(defaultTtl = 300000) {
    this.store = new Map();
    this.defaultTtl = defaultTtl;
  }

  /**
   * Generate a cache key from request parameters.
   * @param {string} prefix
   * @param {object} params
   * @returns {string}
   */
  generateKey(prefix, params = {}) {
    const sorted = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    return `${prefix}:${sorted}`;
  }

  /**
   * Get cached value if not expired.
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store value with optional TTL override.
   * @param {string} key
   * @param {*} data
   * @param {number} ttl - Time to live in ms
   */
  set(key, data, ttl = this.defaultTtl) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    });
  }

  /**
   * Delete a specific cache entry.
   * @param {string} key
   */
  delete(key) {
    this.store.delete(key);
  }

  /** Clear all cached entries. */
  clear() {
    this.store.clear();
  }

  /** @returns {number} Number of cached entries */
  size() {
    return this.store.size;
  }
}

const cacheTtl = parseInt(process.env.CACHE_TTL, 10) || 300000;
const weatherCache = new MemoryCache(cacheTtl);

/**
 * Express middleware — check cache before proceeding to controller.
 * @param {string} prefix - Cache key prefix
 */
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

  // Attach cache key for controller to store result
  req.cacheKey = key;
  next();
};

module.exports = { MemoryCache, weatherCache, cacheMiddleware };
