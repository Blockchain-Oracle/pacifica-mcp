import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import type { OrderResponse } from "../lib/types.js";

export function registerMarketOrderTool(server: McpServer): void {
  server.registerTool(
    "pacifica-market-order",
    {
      title: "Market Order",
      description:
        "Place a market order on Pacifica.\n\nbid = buy/long, ask = sell/short.\n\nRequires wallet — signs the request with your Ed25519 keypair.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC)"),
        side: z
          .enum(["bid", "ask"])
          .describe("Order side: bid = buy/long, ask = sell/short"),
        amount: z.string().describe("Order size as a decimal string"),
        slippage_percent: z
          .string()
          .default("1")
          .describe("Max slippage percent (default 1)"),
        reduce_only: z
          .boolean()
          .default(false)
          .describe("Only reduce existing position (default false)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-market-order invoked");
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "create_market_order",
          {
            symbol: params.symbol,
            amount: params.amount,
            side: params.side,
            slippage_percent: params.slippage_percent,
            reduce_only: params.reduce_only,
          },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<OrderResponse>("/orders/create_market", signed);
        return ok(data);
      } catch (e) {
        logger.error({ err: e }, "pacifica-market-order error");
        return err(String(e));
      }
    },
  );
}
