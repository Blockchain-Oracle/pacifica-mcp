import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";
import type { Position } from "../lib/types.js";

export function registerPositionsTool(server: McpServer): void {
  server.registerTool(
    "pacifica-positions",
    {
      title: "Open Positions",
      description:
        "Get all open positions for an account.\n\nReturns symbol, side, amount, entry_price, margin, funding for each position.\n\nIf no account address is provided, uses the local MCP wallet.\n\nFree — no auth required.",
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
      logger.debug(params, "pacifica-positions invoked");
      const address = params.account ?? loadOrCreateWallet().publicKey;
      const cacheParams = { account: address };
      return withCache("pacifica-positions", cacheParams, async () => {
        try {
          const data = await get<Position[]>("/positions", { account: address });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-positions error");
          return err(String(e));
        }
      });
    },
  );
}
