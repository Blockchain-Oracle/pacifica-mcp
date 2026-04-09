import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";

export function registerCancelOrderTool(server: McpServer): void {
  server.registerTool(
    "pacifica-cancel-order",
    {
      title: "Cancel Order(s)",
      description:
        "Cancel a specific order by ID, or cancel ALL open orders for a symbol.\n\nIf order_id is provided, cancels that single order.\nIf order_id is omitted, cancels all open orders.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC-PERP)"),
        order_id: z
          .string()
          .optional()
          .describe(
            "Specific order ID to cancel. Omit to cancel all open orders.",
          ),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-cancel-order invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);

        if (params.order_id) {
          const signed = signRequest(
            "cancel_order",
            { symbol: params.symbol, order_id: params.order_id },
            keypair.secretKey,
            config.publicKey,
          );
          const data = await post("/orders/cancel", signed);
          return ok(data);
        } else {
          const signed = signRequest(
            "cancel_all_orders",
            {},
            keypair.secretKey,
            config.publicKey,
          );
          const data = await post("/orders/cancel_all", signed);
          return ok(data);
        }
      } catch (e) {
        logger.error({ err: e }, "pacifica-cancel-order error");
        return err(String(e));
      }
    },
  );
}
