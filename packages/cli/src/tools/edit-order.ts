import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import type { OrderResponse } from "../lib/types.js";

export function registerEditOrderTool(server: McpServer): void {
  server.registerTool(
    "pacifica-edit-order",
    {
      title: "Edit Order",
      description:
        "Edit an existing order's price and/or amount.\n\nIdentify the order by order_id or client_order_id.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC-PERP)"),
        price: z.string().describe("New limit price as a decimal string"),
        amount: z.string().describe("New order size as a decimal string"),
        order_id: z
          .string()
          .optional()
          .describe("Order ID to edit. Provide this or client_order_id."),
        client_order_id: z
          .string()
          .optional()
          .describe(
            "Client order ID to edit. Provide this or order_id.",
          ),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-edit-order invoked");
      try {
        if (!params.order_id && !params.client_order_id) {
          return err("Provide either order_id or client_order_id");
        }
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const data: Record<string, unknown> = {
          symbol: params.symbol,
          price: params.price,
          amount: params.amount,
        };
        if (params.order_id) data.order_id = Number(params.order_id);
        if (params.client_order_id)
          data.client_order_id = params.client_order_id;

        const signed = signRequest(
          "edit_order",
          data,
          keypair.secretKey,
          config.publicKey,
        );
        const result = await post<OrderResponse>("/orders/edit", signed);
        return ok(result);
      } catch (e) {
        logger.error({ err: e }, "pacifica-edit-order error");
        return err(String(e));
      }
    },
  );
}
