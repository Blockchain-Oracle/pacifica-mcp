import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";

export function registerOrderHistoryTool(server: McpServer): void {
  server.registerTool(
    "pacifica-order-history",
    {
      title: "Order History",
      description:
        "Get historical orders for an account.\n\nIf no account address is provided, uses the local MCP wallet.\n\nFree — no auth required.",
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
          .describe("Number of historical orders to return (default 50)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-order-history invoked");
      const address = params.account ?? loadOrCreateWallet().publicKey;
      const cacheParams = { account: address, limit: params.limit };
      return withCache("pacifica-order-history", cacheParams, async () => {
        try {
          const data = await get("/orders/history", {
            account: address,
            limit: String(params.limit),
          });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-order-history error");
          return err(String(e));
        }
      });
    },
  );
}
