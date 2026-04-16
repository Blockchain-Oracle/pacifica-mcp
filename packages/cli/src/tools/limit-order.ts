import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import type { OrderResponse } from "../lib/types.js";

export function registerLimitOrderTool(server: McpServer): void {
  server.registerTool(
    "pacifica-limit-order",
    {
      title: "Limit Order",
      description:
        "Place a limit order on Pacifica.\n\nbid = buy/long, ask = sell/short.\nTIF options: GTC (good-til-cancel), IOC (immediate-or-cancel), ALO (add-liquidity-only), TOB (top-of-book).\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC)"),
        side: z
          .enum(["bid", "ask"])
          .describe("Order side: bid = buy/long, ask = sell/short"),
        amount: z.string().describe("Order size as a decimal string"),
        price: z.string().describe("Limit price as a decimal string"),
        tif: z
          .enum(["GTC", "IOC", "ALO", "TOB"])
          .default("GTC")
          .describe("Time-in-force (default GTC)"),
        reduce_only: z
          .boolean()
          .default(false)
          .describe("Only reduce existing position (default false)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-limit-order invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "create_order",
          {
            symbol: params.symbol,
            side: params.side,
            amount: params.amount,
            price: params.price,
            tif: params.tif,
            reduce_only: params.reduce_only,
          },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<OrderResponse>("/orders/create", signed);
        return ok(data);
      } catch (e) {
        logger.error({ err: e }, "pacifica-limit-order error");
        return err(String(e));
      }
    },
  );
}
