/**
 * Response normalizers — convert cryptic single-letter API keys to
 * human/AI-readable field names.
 *
 * If a Pacifica endpoint returns abbreviated keys, add a Raw* type in
 * types.ts and a normalize function here. Tools call the normalizer
 * between get<Raw>() and ok().
 */

import type {
  RawCandle,
  Candle,
  RawOrderBook,
  OrderBook,
  RawOrderBookLevel,
  OrderBookLevel,
} from "./types.js";

// ── Candles ────────────────────────────────────────────────────────────────

function normalizeCandle(raw: RawCandle): Candle {
  return {
    open_time: raw.t,
    close_time: raw.T,
    symbol: raw.s,
    interval: raw.i,
    open: raw.o,
    close: raw.c,
    high: raw.h,
    low: raw.l,
    volume: raw.v,
    trade_count: raw.n,
  };
}

export function normalizeCandles(raw: RawCandle[]): Candle[] {
  return raw.map(normalizeCandle);
}

// ── Order Book ─────────────────────────────────────────────────────────────

function normalizeLevel(raw: RawOrderBookLevel): OrderBookLevel {
  return {
    price: raw.p,
    amount: raw.a,
    num_orders: raw.n,
  };
}

export function normalizeOrderBook(raw: RawOrderBook): OrderBook {
  return {
    symbol: raw.s,
    bids: raw.l[0].map(normalizeLevel),
    asks: raw.l[1].map(normalizeLevel),
    timestamp: raw.t,
  };
}
