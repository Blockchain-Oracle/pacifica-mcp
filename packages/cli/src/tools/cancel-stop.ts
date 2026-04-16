import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js"
import { invalidateCacheAll } from "../lib/cache.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";

export function registerCancelStopTool(server: McpServer): void {
  server.registerTool(
    "pacifica-cancel-stop",
    {
      title: "Cancel Stop Order",
      description:
        "Cancel a specific stop order by ID.\n\nIdentify the order by order_id or client_order_id.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC)"),
        order_id: z
          .string()
          .optional()
          .describe(
            "Stop order ID to cancel. Provide this or client_order_id.",
          ),
        client_order_id: z
          .string()
          .optional()
          .describe(
            "Client order ID of the stop order. Provide this or order_id.",
          ),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-cancel-stop invoked");
      try {
        if (!params.order_id && !params.client_order_id) {
          return err("Provide either order_id or client_order_id");
        }
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const data: Record<string, unknown> = { symbol: params.symbol };
        if (params.order_id) data.order_id = Number(params.order_id);
        if (params.client_order_id)
          data.client_order_id = params.client_order_id;

        const signed = signRequest(
          "cancel_stop_order",
          data,
          keypair.secretKey,
          config.publicKey,
        );
        const result = await post<{ success: boolean }>(
          "/orders/stop/cancel",
          signed,
        );
        invalidateCacheAll();
        return ok(result);
      } catch (e) {
        logger.error({ err: e }, "pacifica-cancel-stop error");
        return err(String(e));
      }
    },
  );
}
