import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";
import type { BalanceEvent, Paginated } from "../lib/types.js";

export function registerBalanceHistoryTool(server: McpServer): void {
  server.registerTool(
    "pacifica-balance-history",
    {
      title: "Balance History",
      description:
        "Get balance event history: deposits, withdrawals, trades, funding payments.\n\nIf no account address is provided, uses the local MCP wallet.\n\nFree — no auth required.",
      inputSchema: z.object({
        account: z
          .string()
          .optional()
          .describe(
            "Solana wallet address to query. Defaults to MCP wallet.",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .default(50)
          .describe("Number of balance events to return (default 50)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-balance-history invoked");
      const address = params.account ?? loadOrCreateWallet().publicKey;
      const cacheParams = { account: address, limit: params.limit };
      return withCache("pacifica-balance-history", cacheParams, async () => {
        try {
          const data = await get<Paginated<BalanceEvent>>("/account/balance/history", {
            account: address,
            limit: String(params.limit),
          });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-balance-history error");
          return err(String(e));
        }
      });
    },
  );
}
