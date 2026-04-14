import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { PriceInfo } from "../lib/types.js";

export function registerPricesTool(server: McpServer): void {
  server.registerTool(
    "pacifica-prices",
    {
      title: "Market Prices",
      description:
        "Get real-time prices for all Pacifica markets, or filter by symbol.\n\nReturns mark, oracle, mid, funding rate, next_funding, open_interest, volume_24h.\n\nFree — no auth required.",
      inputSchema: z.object({
        symbol: z
          .string()
          .optional()
          .describe("Filter to a single symbol (e.g. BTC-PERP)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-prices invoked");
      return withCache("pacifica-prices", params, async () => {
        try {
          const data = await get<PriceInfo[]>("/info/prices");
          if (params.symbol) {
            const filtered = data.filter(
              (p) =>
                p.symbol.toUpperCase() === params.symbol!.toUpperCase(),
            );
            return ok(filtered.length === 1 ? filtered[0] : filtered);
          }
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-prices error");
          return err(String(e));
        }
      });
    },
  );
}
