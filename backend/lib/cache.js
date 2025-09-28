// lib/cache.js
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL || '30'), // Default TTL 30s
  checkperiod: 60,
});

export function setCache(key, data) {
  cache.set(key, data);
}

export function getCache(key) {
  return cache.get(key);
}

export function delCache(key) {
  return cache.del(key);
}

export function flushAllCache() {
  cache.flushAll();
}

export function generateCacheKey(url, tablename, filters, limit) {
  return JSON.stringify({ url, tablename, filters, limit });
}
