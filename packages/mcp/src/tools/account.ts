import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";

export function registerAccountTool(server: McpServer): void {
  server.registerTool(
    "pacifica-account",
    {
      title: "Account Overview",
      description:
        "Get account overview: balance, equity, margin used, positions count, fee level.\n\nIf no account address is provided, uses the local MCP wallet.\n\nFree — no auth required.",
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
      logger.debug(params, "pacifica-account invoked");
      const address = params.account ?? loadOrCreateWallet().publicKey;
      const cacheParams = { account: address };
      return withCache("pacifica-account", cacheParams, async () => {
        try {
          const data = await get("/account", { account: address });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-account error");
          return err(String(e));
        }
      });
    },
  );
}
