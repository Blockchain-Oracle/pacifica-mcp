import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";

export function registerTransferFundsTool(server: McpServer): void {
  server.registerTool(
    "pacifica-transfer-funds",
    {
      title: "Transfer Funds (Subaccount)",
      description:
        "Transfer USDC between your main account and a subaccount.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        to_account: z
          .string()
          .describe(
            "Destination account address (subaccount or main account)",
          ),
        amount: z
          .string()
          .describe("Amount of USDC to transfer as a decimal string"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-transfer-funds invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "transfer_funds",
          { to_account: params.to_account, amount: params.amount },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<{ success: boolean }>(
          "/account/subaccount/transfer",
          signed,
        );
        return ok(data);
      } catch (e) {
        logger.error({ err: e }, "pacifica-transfer-funds error");
        return err(String(e));
      }
    },
  );
}
