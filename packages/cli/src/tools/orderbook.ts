import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { RawOrderBook } from "../lib/types.js";
import { normalizeOrderBook } from "../lib/transforms.js";

export function registerOrderbookTool(server: McpServer): void {
  server.registerTool(
    "pacifica-orderbook",
    {
      title: "Order Book",
      description:
        "Get the order book (bids and asks) for a Pacifica market.\n\nFree — no auth required.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC)"),
        agg_level: z
          .enum(["1", "10", "100", "1000", "10000"])
          .default("1")
          .describe("Aggregation level for price buckets (default 1)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-orderbook invoked");
      return withCache("pacifica-orderbook", params, async () => {
        try {
          const data = await get<RawOrderBook>("/book", {
            symbol: params.symbol,
            agg_level: params.agg_level,
          });
          return ok(normalizeOrderBook(data));
        } catch (e) {
          logger.error({ err: e }, "pacifica-orderbook error");
          return err(String(e));
        }
      });
    },
  );
}
