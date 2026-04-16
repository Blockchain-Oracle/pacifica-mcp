import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { MarketInfo } from "../lib/types.js";

export function registerMarketsTool(server: McpServer): void {
  server.registerTool(
    "pacifica-markets",
    {
      title: "Markets Info",
      description:
        "List all available perpetual markets on Pacifica, or look up a single market by symbol.\n\nReturns symbol, tick_size, max_leverage, lot_size, and more.\n\nFree — no auth required.",
      inputSchema: z.object({
        symbol: z
          .string()
          .optional()
          .describe("Filter to a single market (e.g. BTC)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-markets invoked");
      return withCache("pacifica-markets", params, async () => {
        try {
          const data = await get<MarketInfo[]>("/info");
          if (params.symbol) {
            const filtered = data.filter(
              (m) =>
                m.symbol.toUpperCase() === params.symbol!.toUpperCase(),
            );
            return ok(filtered.length === 1 ? filtered[0] : filtered);
          }
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-markets error");
          return err(String(e));
        }
      });
    },
  );
}
