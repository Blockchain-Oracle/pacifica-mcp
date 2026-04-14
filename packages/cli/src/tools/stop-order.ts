import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import type { OrderResponse } from "../lib/types.js";

export function registerStopOrderTool(server: McpServer): void {
  server.registerTool(
    "pacifica-stop-order",
    {
      title: "Stop Order",
      description:
        "Place a stop order on Pacifica.\n\nTriggers a market (or limit) order when the stop_price is reached.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC-PERP)"),
        side: z
          .enum(["bid", "ask"])
          .describe("Order side: bid = buy/long, ask = sell/short"),
        stop_price: z
          .string()
          .describe("Trigger price as a decimal string"),
        amount: z.string().describe("Order size as a decimal string"),
        limit_price: z
          .string()
          .optional()
          .describe(
            "Limit price after trigger. Omit for stop-market order.",
          ),
        reduce_only: z
          .boolean()
          .default(true)
          .describe("Only reduce existing position (default true)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-stop-order invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);

        const stopOrder: Record<string, unknown> = {
          stop_price: params.stop_price,
          amount: params.amount,
        };
        if (params.limit_price) {
          stopOrder.limit_price = params.limit_price;
        }

        const signed = signRequest(
          "create_stop_order",
          {
            symbol: params.symbol,
            side: params.side,
            reduce_only: params.reduce_only,
            stop_order: stopOrder,
          },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<OrderResponse>("/orders/stop/create", signed);
        return ok(data);
      } catch (e) {
        logger.error({ err: e }, "pacifica-stop-order error");
        return err(String(e));
      }
    },
  );
}
