import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";

export function registerWalletTool(server: McpServer): void {
  server.registerTool(
    "pacifica-wallet",
    {
      title: "Wallet Info",
      description:
        "Show your Pacifica MCP wallet address, network, and balance.\n\nNo parameters required.",
      inputSchema: z.object({}),
    },
    async () => {
      logger.debug("pacifica-wallet invoked");
      try {
        const config = loadOrCreateWallet();
        const info: Record<string, unknown> = {
          publicKey: config.publicKey,
          network: config.network,
        };

        // Try to fetch balance from Pacifica
        try {
          const account = await get<Record<string, unknown>>("/account", {
            account: config.publicKey,
          });
          info.balance = account.balance ?? account;
        } catch {
          info.balance = "Unable to fetch (wallet may not be registered on Pacifica yet)";
        }

        return ok(info);
      } catch (e) {
        logger.error({ err: e }, "pacifica-wallet error");
        return err(String(e));
      }
    },
  );
}
