import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
// margin-mode returns { success: boolean }

export function registerMarginModeTool(server: McpServer): void {
  server.registerTool(
    "pacifica-set-margin-mode",
    {
      title: "Set Margin Mode",
      description:
        "Switch between cross margin and isolated margin for a market.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC-PERP)"),
        is_isolated: z
          .boolean()
          .describe("true = isolated margin, false = cross margin"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-set-margin-mode invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "update_margin_mode",
          { symbol: params.symbol, is_isolated: params.is_isolated },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<{ success: boolean }>("/account/margin", signed);
        return ok(data);
      } catch (e) {
        logger.error({ err: e }, "pacifica-set-margin-mode error");
        return err(String(e));
      }
    },
  );
}
