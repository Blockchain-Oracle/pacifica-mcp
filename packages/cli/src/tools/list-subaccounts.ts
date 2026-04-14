import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair, listLocalSubaccounts, loadSubaccountKey } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import type { SubaccountInfo } from "../lib/types.js";

export function registerListSubaccountsTool(server: McpServer): void {
  server.registerTool(
    "pacifica-list-subaccounts",
    {
      title: "List Subaccounts",
      description:
        "List all subaccounts under your main Pacifica account.\n\nReturns address, balance, fee level, and creation date for each subaccount.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({}),
    },
    async () => {
      logger.debug("pacifica-list-subaccounts invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "list_subaccounts",
          {},
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<{ subaccounts: SubaccountInfo[] }>(
          "/account/subaccount/list",
          signed,
        );

        // Merge with local key status
        const localSubs = listLocalSubaccounts();
        const localAddresses = new Set(localSubs.map((s) => s.publicKey));

        const enriched = (data.subaccounts ?? []).map((sub) => ({
          ...sub,
          has_local_key: localAddresses.has(sub.address),
        }));

        // Include local-only subaccounts that aren't on-chain yet
        const onChainAddresses = new Set(enriched.map((s) => s.address));
        const localOnly = localSubs
          .filter((s) => !onChainAddresses.has(s.publicKey))
          .map((s) => ({
            address: s.publicKey,
            balance: "0",
            pending_balance: "0",
            fee_level: 0,
            fee_mode: "auto" as const,
            use_ltp_for_stop_orders: false,
            created_at: 0,
            has_local_key: true,
            status: "local_only" as const,
          }));

        return ok({
          subaccounts: [...enriched, ...localOnly],
          total: enriched.length + localOnly.length,
          on_chain: enriched.length,
          local_only: localOnly.length,
        });
      } catch (e) {
        logger.error({ err: e }, "pacifica-list-subaccounts error");
        return err(String(e));
      }
    },
  );
}
