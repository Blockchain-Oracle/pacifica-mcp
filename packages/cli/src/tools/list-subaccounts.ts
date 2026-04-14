import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
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
        return ok(data);
      } catch (e) {
        logger.error({ err: e }, "pacifica-list-subaccounts error");
        return err(String(e));
      }
    },
  );
}
