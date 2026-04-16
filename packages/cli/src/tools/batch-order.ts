import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js"
import { invalidateCacheAll } from "../lib/cache.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import type { BatchResponse } from "../lib/types.js";

const ActionSchema = z.object({
  type: z
    .enum(["Create", "Cancel"])
    .describe("Action type: Create or Cancel"),
  symbol: z.string().describe("Market symbol (e.g. BTC)"),
  side: z
    .enum(["bid", "ask"])
    .optional()
    .describe("Order side (required for Create)"),
  amount: z
    .string()
    .optional()
    .describe("Order size (required for Create)"),
  price: z
    .string()
    .optional()
    .describe("Limit price (required for Create)"),
  tif: z
    .enum(["GTC", "IOC", "ALO", "TOB"])
    .optional()
    .describe("Time-in-force (default GTC, for Create)"),
  reduce_only: z
    .boolean()
    .optional()
    .describe("Reduce-only flag (for Create)"),
  order_id: z
    .string()
    .optional()
    .describe("Order ID to cancel (for Cancel)"),
  client_order_id: z
    .string()
    .optional()
    .describe("Client order ID to cancel (for Cancel)"),
});

export function registerBatchOrderTool(server: McpServer): void {
  server.registerTool(
    "pacifica-batch-order",
    {
      title: "Batch Orders",
      description:
        "Submit a batch of up to 10 order actions (create and/or cancel) in a single request.\n\nEach action is individually signed.\n\nRequires wallet — signs each action with your Ed25519 keypair.",
      inputSchema: z.object({
        actions: z
          .array(ActionSchema)
          .min(1)
          .max(10)
          .describe("Array of order actions (max 10)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-batch-order invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);

        const signedActions = params.actions.map((action) => {
          if (action.type === "Create") {
            const data: Record<string, unknown> = {
              symbol: action.symbol,
              side: action.side,
              amount: action.amount,
              price: action.price,
              tif: action.tif ?? "GTC",
              reduce_only: action.reduce_only ?? false,
            };
            return {
              type: action.type,
              ...signRequest(
                "create_order",
                data,
                keypair.secretKey,
                config.publicKey,
              ),
            };
          } else {
            const data: Record<string, unknown> = {
              symbol: action.symbol,
            };
            if (action.order_id) data.order_id = Number(action.order_id);
            if (action.client_order_id)
              data.client_order_id = action.client_order_id;
            return {
              type: action.type,
              ...signRequest(
                "cancel_order",
                data,
                keypair.secretKey,
                config.publicKey,
              ),
            };
          }
        });

        const result = await post<BatchResponse>("/orders/batch", {
          actions: signedActions,
        });
        invalidateCacheAll();
        return ok(result);
      } catch (e) {
        logger.error({ err: e }, "pacifica-batch-order error");
        return err(String(e));
      }
    },
  );
}
