import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import type { CancelAllResponse } from "../lib/types.js";

export function registerCancelOrderTool(server: McpServer): void {
  server.registerTool(
    "pacifica-cancel-order",
    {
      title: "Cancel Order(s)",
      description:
        "Cancel a specific order by ID, or cancel ALL open orders.\n\nIf order_id is provided, cancels that single order.\nIf order_id is omitted, cancels all open orders (set all_symbols and exclude_reduce_only).\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z
          .string()
          .optional()
          .describe(
            "Market symbol (e.g. BTC-PERP). Required for single cancel. Optional filter for cancel-all when all_symbols is false.",
          ),
        order_id: z
          .string()
          .optional()
          .describe(
            "Specific order ID to cancel. Omit to cancel all open orders.",
          ),
        all_symbols: z
          .boolean()
          .default(true)
          .describe(
            "Cancel orders across all symbols (default true). Only used for cancel-all.",
          ),
        exclude_reduce_only: z
          .boolean()
          .default(false)
          .describe(
            "Exclude reduce-only orders from cancellation (default false). Only used for cancel-all.",
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
            { symbol: params.symbol ?? "", order_id: params.order_id },
            keypair.secretKey,
            config.publicKey,
          );
          const data = await post<{ success: boolean }>("/orders/cancel", signed);
          return ok(data);
        } else {
          const cancelData: Record<string, unknown> = {
            all_symbols: params.all_symbols,
            exclude_reduce_only: params.exclude_reduce_only,
          };
          if (params.symbol) {
            cancelData.symbol = params.symbol;
          }
          const signed = signRequest(
            "cancel_all_orders",
            cancelData,
            keypair.secretKey,
            config.publicKey,
          );
          const data = await post<CancelAllResponse>("/orders/cancel_all", signed);
          return ok(data);
        }
      } catch (e) {
        logger.error({ err: e }, "pacifica-cancel-order error");
        return err(String(e));
      }
    },
  );
}
