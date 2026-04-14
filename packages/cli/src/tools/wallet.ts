import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, listLocalSubaccounts } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";
import type { AccountInfo } from "../lib/types.js";

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
          const account = await get<AccountInfo>("/account", {
            account: config.publicKey,
          });
          info.balance = account.balance;
          info.account_equity = account.account_equity;
          info.positions_count = account.positions_count;
        } catch {
          info.balance = "Unable to fetch (wallet may not be registered on Pacifica yet)";
        }

        // Show locally saved subaccounts
        const localSubs = listLocalSubaccounts();
        if (localSubs.length > 0) {
          info.subaccounts = localSubs.map((s) => ({
            address: s.publicKey,
            created: s.createdAt ?? "unknown",
          }));
          info.subaccount_count = localSubs.length;
        } else {
          info.subaccounts = [];
          info.subaccount_count = 0;
        }

        return ok(info);
      } catch (e) {
        logger.error({ err: e }, "pacifica-wallet error");
        return err(String(e));
      }
    },
  );
}
