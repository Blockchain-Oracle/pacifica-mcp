import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";
import type { TradeRecord, Paginated } from "../lib/types.js";

export function registerTradeHistoryTool(server: McpServer): void {
  server.registerTool(
    "pacifica-trade-history",
    {
      title: "Trade History",
      description:
        "Get historical trades for an account, with PnL and fees.\n\nIf no account address is provided, uses the local MCP wallet.\n\nFree — no auth required.",
      inputSchema: z.object({
        account: z
          .string()
          .optional()
          .describe(
            "Solana wallet address to query. Defaults to MCP wallet.",
          ),
        symbol: z
          .string()
          .optional()
          .describe("Filter by market symbol (e.g. BTC-PERP)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .default(50)
          .describe("Number of trades to return (default 50)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-trade-history invoked");
      const address = params.account ?? loadOrCreateWallet().publicKey;
      const cacheParams = {
        account: address,
        symbol: params.symbol,
        limit: params.limit,
      };
      return withCache("pacifica-trade-history", cacheParams, async () => {
        try {
          const queryParams: Record<string, string> = {
            account: address,
            limit: String(params.limit),
          };
          if (params.symbol) queryParams.symbol = params.symbol;
          const data = await get<Paginated<TradeRecord>>("/trades/history", queryParams);
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-trade-history error");
          return err(String(e));
        }
      });
    },
  );
}
