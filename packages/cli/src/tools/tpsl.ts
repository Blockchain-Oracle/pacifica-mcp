import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
// tpsl returns { success: boolean }

export function registerTpslTool(server: McpServer): void {
  server.registerTool(
    "pacifica-set-tpsl",
    {
      title: "Set Take-Profit / Stop-Loss",
      description:
        "Set take-profit and/or stop-loss prices on an existing position.\n\nProvide at least one of take_profit_price or stop_loss_price.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC)"),
        side: z
          .enum(["bid", "ask"])
          .describe("Exit side: use ask to close a long, bid to close a short"),
        take_profit_price: z
          .string()
          .optional()
          .describe("Take-profit trigger price as a decimal string"),
        stop_loss_price: z
          .string()
          .optional()
          .describe("Stop-loss trigger price as a decimal string"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-set-tpsl invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);

        const data: Record<string, unknown> = {
          symbol: params.symbol,
          side: params.side,
        };
        if (params.take_profit_price) {
          data.take_profit = { stop_price: params.take_profit_price };
        }
        if (params.stop_loss_price) {
          data.stop_loss = { stop_price: params.stop_loss_price };
        }

        const signed = signRequest(
          "set_position_tpsl",
          data,
          keypair.secretKey,
          config.publicKey,
        );
        const result = await post<{ success: boolean }>("/positions/tpsl", signed);
        return ok(result);
      } catch (e) {
        logger.error({ err: e }, "pacifica-set-tpsl error");
        return err(String(e));
      }
    },
  );
}
