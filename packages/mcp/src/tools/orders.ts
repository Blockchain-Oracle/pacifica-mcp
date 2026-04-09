import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";

export function registerOrdersTool(server: McpServer): void {
  server.registerTool(
    "pacifica-orders",
    {
      title: "Open Orders",
      description:
        "Get all open orders for an account.\n\nIf no account address is provided, uses the local MCP wallet.\n\nFree — no auth required.",
      inputSchema: z.object({
        account: z
          .string()
          .optional()
          .describe(
            "Solana wallet address to query. Defaults to MCP wallet.",
          ),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-orders invoked");
      const address = params.account ?? loadOrCreateWallet().publicKey;
      const cacheParams = { account: address };
      return withCache("pacifica-orders", cacheParams, async () => {
        try {
          const data = await get("/orders", { account: address });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-orders error");
          return err(String(e));
        }
      });
    },
  );
}
