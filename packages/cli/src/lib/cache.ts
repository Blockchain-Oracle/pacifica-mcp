import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "./logger.js";

const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  result: CallToolResult;
  expires: number;
}

const store = new Map<string, CacheEntry>();

/**
 * Invalidate cached entries for specific tools.
 * Call this after write operations to ensure subsequent reads
 * return fresh data instead of stale cached results.
 *
 * Pass tool name prefixes — e.g. "pacifica-positions" clears all
 * cached entries whose key starts with that tool name.
 */
export function invalidateCache(...toolPrefixes: string[]): void {
  for (const [key] of store) {
    if (toolPrefixes.some((prefix) => key.startsWith(prefix))) {
      store.delete(key);
      logger.debug({ key }, "cache invalidated");
    }
  }
}

/**
 * Invalidate all cached entries. Use after any write operation
 * when you're unsure which read tools might be affected.
 */
export function invalidateCacheAll(): void {
  const size = store.size;
  store.clear();
  if (size > 0) logger.debug({ cleared: size }, "cache fully invalidated");
}

/**
 * Wrap a tool call with response caching.
 * Identical tool+params within the TTL return the cached result
 * with no API call.
 */
export async function withCache(
  toolName: string,
  params: Record<string, unknown>,
  fn: () => Promise<CallToolResult>,
): Promise<CallToolResult> {
  const key = `${toolName}:${JSON.stringify(params)}`;

  const cached = store.get(key);
  if (cached && Date.now() < cached.expires) {
    logger.debug({ toolName }, "cache hit");

    const original = cached.result;
    if (original.content[0]?.type === "text") {
      return {
        ...original,
        content: [
          {
            type: "text" as const,
            text: `[cached]\n\n${original.content[0].text}`,
          },
        ],
      };
    }
    return original;
  }

  const result = await fn();

  if (!result.isError) {
    store.set(key, { result, expires: Date.now() + TTL_MS });
  }

  // Evict expired entries periodically
  if (store.size > 50) {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now >= v.expires) store.delete(k);
    }
  }

  return result;
}
