// lib/queryWithRetry.js
// Retries with exponential backoff to mitigate replica lag
export async function queryWithRetry(pool, query, values = [], {
  retries = 5,
  baseDelayMs = 200,
  maxDelayMs = 1000,
} = {}) {
  let attempt = 0;
  let lastError;
  while (attempt < retries) {
    try {
      return await pool.query(query, values);
    } catch (err) {
      lastError = err;
      attempt++;
      const left = retries - attempt;
      console.warn(`⚠️ Query failed: ${err.message}. Retries left: ${left}`);
      if (left <= 0) break;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}
