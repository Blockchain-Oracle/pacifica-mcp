import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { Candle } from "../lib/types.js";

const INTERVAL_MS: Record<string, number> = {
  "1m": 60_000,
  "3m": 180_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "2h": 7_200_000,
  "4h": 14_400_000,
  "8h": 28_800_000,
  "12h": 43_200_000,
  "1d": 86_400_000,
};

export function registerCandlesTool(server: McpServer): void {
  server.registerTool(
    "pacifica-candles",
    {
      title: "OHLCV Candles",
      description:
        "Get OHLCV candlestick data for a Pacifica market.\n\nFree — no auth required.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC-PERP)"),
        interval: z
          .enum([
            "1m",
            "3m",
            "5m",
            "15m",
            "30m",
            "1h",
            "2h",
            "4h",
            "8h",
            "12h",
            "1d",
          ])
          .describe("Candle interval"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(1000)
          .default(100)
          .describe("Number of candles to return (default 100)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-candles invoked");
      return withCache("pacifica-candles", params, async () => {
        try {
          const intervalMs = INTERVAL_MS[params.interval] ?? 60_000;
          const startTime = Date.now() - params.limit * intervalMs;
          const data = await get<Candle[]>("/kline", {
            symbol: params.symbol,
            interval: params.interval,
            start_time: String(startTime),
          });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-candles error");
          return err(String(e));
        }
      });
    },
  );
}
