// lib/poolManager.js
import { Pool } from 'pg';

const poolCache = new Map();

export function createPool(url) {
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  pool.on('error', (err) => {
    console.error('🔥 Pool error:', err.message);
  });

  return pool;
}

export function getPool(url) {
  if (!url) throw new Error("Connection string is required.");

  if (!poolCache.has(url)) {
    const pool = createPool(url);
    poolCache.set(url, pool);
  }

  return poolCache.get(url);
}

export function resetPool(url) {
  const oldPool = poolCache.get(url);
  if (oldPool) oldPool.end().catch(() => {});
  const newPool = createPool(url);
  poolCache.set(url, newPool);
  return newPool;
}
