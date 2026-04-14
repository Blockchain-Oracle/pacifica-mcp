import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";
import type { AccountSettings } from "../lib/types.js";

export function registerAccountSettingsTool(server: McpServer): void {
  server.registerTool(
    "pacifica-account-settings",
    {
      title: "Account Settings",
      description:
        "Get account settings including margin settings and leverage per market.\n\nIf no account address is provided, uses the local MCP wallet.\n\nFree — no auth required.",
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
      logger.debug(params, "pacifica-account-settings invoked");
      const address = params.account ?? loadOrCreateWallet().publicKey;
      const cacheParams = { account: address };
      return withCache("pacifica-account-settings", cacheParams, async () => {
        try {
          const data = await get<AccountSettings>("/account/settings", {
            account: address,
          });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-account-settings error");
          return err(String(e));
        }
      });
    },
  );
}
