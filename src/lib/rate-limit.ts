// Best-effort in-memory limiter for the MVP (single-instance dev/demo use).
// Swap for a shared store (e.g. Upstash Redis) before scaling to multiple
// server instances, since this Map does not survive across them.
const requestLog = new Map<string, number[]>();

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return timestamps.length > max;
}
