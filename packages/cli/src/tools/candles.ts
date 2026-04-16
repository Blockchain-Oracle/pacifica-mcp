import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { RawCandle } from "../lib/types.js";
import { normalizeCandles } from "../lib/transforms.js";
import { INTERVAL_MS } from "../lib/constants.js";

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
          const data = await get<RawCandle[]>("/kline", {
            symbol: params.symbol,
            interval: params.interval,
            start_time: String(startTime),
          });
          return ok(normalizeCandles(data));
        } catch (e) {
          logger.error({ err: e }, "pacifica-candles error");
          return err(String(e));
        }
      });
    },
  );
}
