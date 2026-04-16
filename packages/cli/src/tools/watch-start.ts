import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { wsManager } from "../lib/ws.js";
import { CHANNELS, buildParams } from "./watch.js";

export function registerWatchStartTool(server: McpServer): void {
  server.registerTool(
    "pacifica-watch-start",
    {
      title: "Watch Start",
      description:
        "Start a persistent WebSocket subscription. Events are buffered until you read them with pacifica-watch-read.\n\nChannels: prices, trades, orderbook, account_info, account_positions, account_trades.\n\nUse pacifica-watch-read to retrieve buffered events, pacifica-watch-stop to end.",
      inputSchema: z.object({
        channel: z
          .enum(CHANNELS)
          .describe("WebSocket channel to subscribe to"),
        symbol: z
          .string()
          .optional()
          .describe("Market symbol (e.g. BTC) — required for trades, orderbook"),
        account: z
          .string()
          .optional()
          .describe("Wallet address — required for account_* channels, defaults to local wallet"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-watch-start invoked");
      try {
        const wsParams = buildParams(params.channel, params.symbol, params.account);
        const subscriptionId = await wsManager.subscribe(
          params.channel,
          wsParams,
        );
        return ok({
          subscription_id: subscriptionId,
          channel: params.channel,
          message:
            "Subscription started. Use pacifica-watch-read to check events.",
        });
      } catch (e) {
        logger.error({ err: e }, "pacifica-watch-start error");
        return err(String(e));
      }
    },
  );
}
