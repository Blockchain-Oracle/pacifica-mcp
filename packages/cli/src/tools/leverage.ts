import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js"
import { invalidateCacheAll } from "../lib/cache.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
// leverage returns { success: boolean }

export function registerLeverageTool(server: McpServer): void {
  server.registerTool(
    "pacifica-set-leverage",
    {
      title: "Set Leverage",
      description:
        "Set the leverage for a Pacifica market.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC)"),
        leverage: z
          .number()
          .int()
          .min(1)
          .max(100)
          .describe("Leverage multiplier (e.g. 10)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-set-leverage invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "update_leverage",
          { symbol: params.symbol, leverage: params.leverage },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<{ success: boolean }>("/account/leverage", signed);
        invalidateCacheAll();
        return ok(data);
      } catch (e) {
        logger.error({ err: e }, "pacifica-set-leverage error");
        return err(String(e));
      }
    },
  );
}
