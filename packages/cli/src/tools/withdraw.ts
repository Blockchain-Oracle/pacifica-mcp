import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js"
import { invalidateCacheAll } from "../lib/cache.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";

export function registerWithdrawTool(server: McpServer): void {
  server.registerTool(
    "pacifica-withdraw",
    {
      title: "Withdraw USDC",
      description:
        "Withdraw USDC from your Pacifica account back to your Solana wallet.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        amount: z
          .string()
          .describe("Amount of USDC to withdraw as a decimal string"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-withdraw invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "withdraw",
          { amount: params.amount },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<{ success: boolean }>("/account/withdraw", signed);
        invalidateCacheAll();
        return ok(data);
      } catch (e) {
        logger.error({ err: e }, "pacifica-withdraw error");
        return err(String(e));
      }
    },
  );
}
