import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { wsManager } from "../lib/ws.js";
import type { WsEvent } from "../lib/ws.js";
import { loadOrCreateWallet } from "../lib/wallet.js";

const CHANNELS = [
  "prices",
  "trades",
  "orderbook",
  "account_info",
  "account_positions",
  "account_trades",
] as const;

function buildParams(
  channel: string,
  symbol?: string,
  account?: string,
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (symbol) params.symbol = symbol;
  if (channel.startsWith("account_")) {
    params.account = account ?? loadOrCreateWallet().publicKey;
  }
  return params;
}

function summarizeEvents(
  channel: string,
  events: WsEvent[],
  durationMs: number,
): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    count: events.length,
    duration_ms: durationMs,
    first_at: events.length > 0 ? new Date(events[0].receivedAt).toISOString() : null,
    last_at:
      events.length > 0
        ? new Date(events[events.length - 1].receivedAt).toISOString()
        : null,
  };

  if (channel === "prices" && events.length > 0) {
    const pricesBySymbol = new Map<
      string,
      { first: number; last: number }
    >();

    for (const ev of events) {
      // Prices channel sends data as an array of price objects
      const items = Array.isArray(ev.data)
        ? (ev.data as Record<string, unknown>[])
        : [ev.data as Record<string, unknown>];

      for (const d of items) {
        const sym = (d.symbol as string) ?? "unknown";
        const price = parseFloat((d.mark ?? d.mark_price ?? d.price ?? "0") as string);
        if (!pricesBySymbol.has(sym)) {
          pricesBySymbol.set(sym, { first: price, last: price });
        } else {
          pricesBySymbol.get(sym)!.last = price;
        }
      }
    }

    summary.symbols_seen = [...pricesBySymbol.keys()];
    summary.price_changes = [...pricesBySymbol.entries()].map(
      ([sym, { first, last }]) => ({
        symbol: sym,
        start: first,
        end: last,
        change_pct:
          first !== 0
            ? parseFloat((((last - first) / first) * 100).toFixed(4))
            : 0,
      }),
    );
  }

  if (channel === "trades" && events.length > 0) {
    let volume = 0;
    let buyCount = 0;
    let sellCount = 0;
    for (const ev of events) {
      const d = ev.data as Record<string, unknown>;
      volume += parseFloat((d.amount ?? "0") as string);
      const side = (d.side as string) ?? "";
      if (side === "bid") buyCount++;
      else if (side === "ask") sellCount++;
    }
    summary.trade_count = events.length;
    summary.volume = volume;
    summary.buy_count = buyCount;
    summary.sell_count = sellCount;
  }

  return summary;
}

export function registerWatchTool(server: McpServer): void {
  server.registerTool(
    "pacifica-watch",
    {
      title: "Watch (Snapshot)",
      description:
        "Subscribe to a real-time WebSocket channel, collect events for a duration, then return them.\n\nChannels: prices, trades, orderbook, account_info, account_positions, account_trades.\n\nNo auth required for market channels. Account channels use your wallet.",
      inputSchema: z.object({
        channel: z
          .enum(CHANNELS)
          .describe("WebSocket channel to subscribe to"),
        symbol: z
          .string()
          .optional()
          .describe("Market symbol (e.g. BTC-PERP) — required for trades, orderbook"),
        account: z
          .string()
          .optional()
          .describe("Wallet address — required for account_* channels, defaults to local wallet"),
        duration: z
          .number()
          .min(1)
          .max(60)
          .default(10)
          .describe("Seconds to collect events (default 10, max 60)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-watch invoked");
      try {
        const wsParams = buildParams(params.channel, params.symbol, params.account);
        const durationMs = params.duration * 1000;
        const events = await wsManager.snapshot(
          params.channel,
          wsParams,
          durationMs,
        );
        const summary = summarizeEvents(params.channel, events, durationMs);
        return ok({ events, summary });
      } catch (e) {
        logger.error({ err: e }, "pacifica-watch error");
        return err(String(e));
      }
    },
  );
}

export { buildParams, summarizeEvents, CHANNELS };
