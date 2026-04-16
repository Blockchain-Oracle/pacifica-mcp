import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { RecentTrade } from "../lib/types.js";

export function registerRecentTradesTool(server: McpServer): void {
  server.registerTool(
    "pacifica-recent-trades",
    {
      title: "Recent Trades",
      description:
        "Get recent trades for a Pacifica market.\n\nReturns price, amount, side, and cause for each trade.\n\nFree — no auth required.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-recent-trades invoked");
      return withCache("pacifica-recent-trades", params, async () => {
        try {
          const data = await get<RecentTrade[]>("/trades", { symbol: params.symbol });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-recent-trades error");
          return err(String(e));
        }
      });
    },
  );
}
