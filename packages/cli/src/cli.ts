#!/usr/bin/env node
import { Command } from "commander";
import { get, post } from "./lib/api.js";
import { signRequest } from "./lib/signing.js";
import { loadOrCreateWallet, getKeypair } from "./lib/wallet.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { normalizeOrderBook, normalizeCandles } from "./lib/transforms.js";
import type {
  MarketInfo,
  PriceInfo,
  RawOrderBook,
  RawCandle,
  RecentTrade,
  FundingRateHistory,
  Paginated,
  AccountInfo,
  AccountSettings,
  Position,
  TradeRecord,
  EquityPoint,
  BalanceEvent,
  OpenOrder,
  OrderHistoryRecord,
  OrderHistoryById,
  OrderResponse,
  CancelAllResponse,
  BatchResponse,
  SubaccountInfo,
} from "./lib/types.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function output(data: unknown): void {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

function fatal(e: unknown): never {
  const msg = e instanceof Error ? e.message : String(e);
  process.stderr.write(`Error: ${msg}\n`);
  process.exit(1);
}

/** Resolve account address: use --account flag or default to local wallet. */
function resolveAccount(account?: string): string {
  return account ?? loadOrCreateWallet().publicKey;
}

// ── Interval helper for candle commands ──────────────────────────────────────

const INTERVAL_MS: Record<string, number> = {
  "1m": 60_000,
  "3m": 180_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "2h": 7_200_000,
  "4h": 14_400_000,
  "8h": 28_800_000,
  "12h": 43_200_000,
  "1d": 86_400_000,
};

// ── Tools catalog (for `tools` command) ──────────────────────────────────────

const TOOLS_CATALOG = {
  "Market Data (free)": [
    { command: "markets", description: "List all markets or look up a single market" },
    { command: "prices", description: "Real-time prices, funding, open interest, volume" },
    { command: "orderbook", description: "Order book bids and asks" },
    { command: "candles", description: "OHLCV candlestick data" },
    { command: "mark-candles", description: "Mark price OHLCV candlestick data" },
    { command: "recent-trades", description: "Recent trades for a market" },
    { command: "funding-rates", description: "Historical funding rates" },
  ],
  "Account Monitoring (free)": [
    { command: "account", description: "Account overview: balance, equity, margin" },
    { command: "account-settings", description: "Account settings: margin mode, leverage" },
    { command: "positions", description: "Open positions with entry price and PnL" },
    { command: "trade-history", description: "Historical trades with PnL and fees" },
    { command: "portfolio", description: "Portfolio equity history over time" },
    { command: "balance-history", description: "Balance events: deposits, withdrawals, funding" },
    { command: "orders", description: "All open orders" },
    { command: "order-history", description: "Historical orders" },
    { command: "order-by-id", description: "Full event history for a specific order" },
  ],
  "Trading (requires wallet)": [
    { command: "market-order", description: "Place a market order (bid=long, ask=short)" },
    { command: "limit-order", description: "Place a limit order with TIF options" },
    { command: "stop-order", description: "Place a stop order (stop-market or stop-limit)" },
    { command: "edit-order", description: "Edit an existing order's price and amount" },
    { command: "batch-order", description: "Submit up to 10 create/cancel actions" },
    { command: "set-tpsl", description: "Set take-profit / stop-loss on a position" },
    { command: "cancel", description: "Cancel a specific order or all open orders" },
    { command: "cancel-stop", description: "Cancel a specific stop order" },
    { command: "set-leverage", description: "Set leverage for a market" },
    { command: "set-margin-mode", description: "Switch between cross and isolated margin" },
  ],
  "Account Management (requires wallet)": [
    { command: "withdraw", description: "Withdraw funds from Pacifica to your wallet" },
    { command: "create-subaccount", description: "Create a new subaccount" },
    { command: "list-subaccounts", description: "List all subaccounts" },
    { command: "transfer-funds", description: "Transfer funds between accounts" },
  ],
  "Real-Time (WebSocket)": [
    { command: "watch", description: "Snapshot: collect WebSocket events for N seconds" },
    { command: "watch-start", description: "Start a persistent WebSocket subscription" },
    { command: "watch-read", description: "Read buffered events from a subscription" },
    { command: "watch-stop", description: "Stop a WebSocket subscription" },
  ],
  System: [
    { command: "wallet", description: "Show wallet address, network, and balance" },
    { command: "tools", description: "List all available CLI commands" },
  ],
};

// ── Program ──────────────────────────────────────────────────────────────────

const program = new Command()
  .name("pacifica-cli")
  .description(
    "Pacifica MCP Server & CLI — AI-powered trading tools for Pacifica DEX",
  )
  .version("0.1.0");

// Default action (no subcommand) → start MCP server
program.action(async () => {
  const { StdioServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/stdio.js"
  );
  const { createMcpServer } = await import("./server.js");
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
});

// ═══════════════════════════════════════════════════════════════════════════════
// MARKET DATA (7)
// ═══════════════════════════════════════════════════════════════════════════════

program
  .command("markets")
  .description("List all available perpetual markets, or look up one by symbol")
  .option("--symbol <symbol>", "Filter to a single market (e.g. BTC-PERP)")
  .action(async (opts: { symbol?: string }) => {
    try {
      const data = await get<MarketInfo[]>("/info");
      if (opts.symbol) {
        const filtered = data.filter(
          (m) => m.symbol.toUpperCase() === opts.symbol!.toUpperCase(),
        );
        output(filtered.length === 1 ? filtered[0] : filtered);
      } else {
        output(data);
      }
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("prices")
  .description("Get real-time prices for all or specific markets")
  .option("--symbol <symbol>", "Filter to a single symbol (e.g. BTC-PERP)")
  .action(async (opts: { symbol?: string }) => {
    try {
      const data = await get<PriceInfo[]>("/info/prices");
      if (opts.symbol) {
        const filtered = data.filter(
          (p) => p.symbol.toUpperCase() === opts.symbol!.toUpperCase(),
        );
        output(filtered.length === 1 ? filtered[0] : filtered);
      } else {
        output(data);
      }
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("orderbook")
  .description("Get the order book (bids and asks) for a market")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .option(
    "--agg-level <level>",
    "Aggregation level: 1, 10, 100, 1000, 10000",
    "1",
  )
  .action(async (opts: { symbol: string; aggLevel: string }) => {
    try {
      const data = await get<RawOrderBook>("/book", {
        symbol: opts.symbol,
        agg_level: opts.aggLevel,
      });
      output(normalizeOrderBook(data));
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("candles")
  .description("Get OHLCV candlestick data for a market")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption(
    "--interval <interval>",
    "Candle interval: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 8h, 12h, 1d",
  )
  .option("--limit <n>", "Number of candles (default 100)", "100")
  .action(
    async (opts: { symbol: string; interval: string; limit: string }) => {
      try {
        const limit = parseInt(opts.limit, 10);
        const intervalMs = INTERVAL_MS[opts.interval] ?? 60_000;
        const startTime = Date.now() - limit * intervalMs;
        const data = await get<RawCandle[]>("/kline", {
          symbol: opts.symbol,
          interval: opts.interval,
          start_time: String(startTime),
        });
        output(normalizeCandles(data));
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("mark-candles")
  .description("Get mark price OHLCV candlestick data for a market")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption(
    "--interval <interval>",
    "Candle interval: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 8h, 12h, 1d",
  )
  .option("--limit <n>", "Number of candles (default 100)", "100")
  .action(
    async (opts: { symbol: string; interval: string; limit: string }) => {
      try {
        const limit = parseInt(opts.limit, 10);
        const intervalMs = INTERVAL_MS[opts.interval] ?? 60_000;
        const startTime = Date.now() - limit * intervalMs;
        const data = await get<RawCandle[]>("/kline/mark", {
          symbol: opts.symbol,
          interval: opts.interval,
          start_time: String(startTime),
        });
        output(normalizeCandles(data));
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("recent-trades")
  .description("Get recent trades for a market")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .action(async (opts: { symbol: string }) => {
    try {
      const data = await get<RecentTrade[]>("/trades", {
        symbol: opts.symbol,
      });
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("funding-rates")
  .description("Get historical funding rates for a market")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .option("--limit <n>", "Number of entries (default 20)", "20")
  .action(async (opts: { symbol: string; limit: string }) => {
    try {
      const data = await get<Paginated<FundingRateHistory>>(
        "/funding_rate/history",
        {
          symbol: opts.symbol,
          limit: opts.limit,
        },
      );
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT MONITORING (9)
// ═══════════════════════════════════════════════════════════════════════════════

program
  .command("account")
  .description("Get account overview: balance, equity, margin, positions count")
  .option("--account <address>", "Solana wallet address (defaults to MCP wallet)")
  .action(async (opts: { account?: string }) => {
    try {
      const address = resolveAccount(opts.account);
      const data = await get<AccountInfo>("/account", { account: address });
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("account-settings")
  .description("Get account settings: margin mode, leverage per market")
  .option("--account <address>", "Solana wallet address (defaults to MCP wallet)")
  .action(async (opts: { account?: string }) => {
    try {
      const address = resolveAccount(opts.account);
      const data = await get<AccountSettings>("/account/settings", {
        account: address,
      });
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("positions")
  .description("Get all open positions for an account")
  .option("--account <address>", "Solana wallet address (defaults to MCP wallet)")
  .action(async (opts: { account?: string }) => {
    try {
      const address = resolveAccount(opts.account);
      const data = await get<Position[]>("/positions", { account: address });
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("trade-history")
  .description("Get historical trades with PnL and fees")
  .option("--account <address>", "Solana wallet address (defaults to MCP wallet)")
  .option("--symbol <symbol>", "Filter by market symbol (e.g. BTC-PERP)")
  .option("--limit <n>", "Number of trades (default 50)", "50")
  .action(
    async (opts: { account?: string; symbol?: string; limit: string }) => {
      try {
        const address = resolveAccount(opts.account);
        const params: Record<string, string> = {
          account: address,
          limit: opts.limit,
        };
        if (opts.symbol) params.symbol = opts.symbol;
        const data = await get<Paginated<TradeRecord>>(
          "/trades/history",
          params,
        );
        output(data);
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("portfolio")
  .description("Get portfolio equity history over time")
  .option("--account <address>", "Solana wallet address (defaults to MCP wallet)")
  .option(
    "--time-range <range>",
    "Time range: 1d, 7d, 14d, 30d, all (default 7d)",
    "7d",
  )
  .action(async (opts: { account?: string; timeRange: string }) => {
    try {
      const address = resolveAccount(opts.account);
      const data = await get<EquityPoint[]>("/portfolio", {
        account: address,
        time_range: opts.timeRange,
      });
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("balance-history")
  .description("Get balance event history: deposits, withdrawals, funding")
  .option("--account <address>", "Solana wallet address (defaults to MCP wallet)")
  .option("--limit <n>", "Number of events (default 50)", "50")
  .action(async (opts: { account?: string; limit: string }) => {
    try {
      const address = resolveAccount(opts.account);
      const data = await get<Paginated<BalanceEvent>>(
        "/account/balance/history",
        {
          account: address,
          limit: opts.limit,
        },
      );
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("orders")
  .description("Get all open orders for an account")
  .option("--account <address>", "Solana wallet address (defaults to MCP wallet)")
  .action(async (opts: { account?: string }) => {
    try {
      const address = resolveAccount(opts.account);
      const data = await get<OpenOrder[]>("/orders", { account: address });
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("order-history")
  .description("Get historical orders for an account")
  .option("--account <address>", "Solana wallet address (defaults to MCP wallet)")
  .option("--limit <n>", "Number of orders (default 50)", "50")
  .action(async (opts: { account?: string; limit: string }) => {
    try {
      const address = resolveAccount(opts.account);
      const data = await get<Paginated<OrderHistoryRecord>>(
        "/orders/history",
        {
          account: address,
          limit: opts.limit,
        },
      );
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("order-by-id")
  .description("Get the full event history for a specific order")
  .requiredOption("--order-id <id>", "The order ID to look up")
  .action(async (opts: { orderId: string }) => {
    try {
      const data = await get<OrderHistoryById[]>("/orders/history_by_id", {
        order_id: opts.orderId,
      });
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

// ═══════════════════════════════════════════════════════════════════════════════
// TRADING (10)
// ═══════════════════════════════════════════════════════════════════════════════

program
  .command("market-order")
  .description("Place a market order (bid = buy/long, ask = sell/short)")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption("--side <side>", "Order side: bid or ask")
  .requiredOption("--amount <amount>", "Order size as a decimal string")
  .option("--slippage <percent>", "Max slippage percent (default 1)", "1")
  .option("--reduce-only", "Only reduce existing position", false)
  .action(
    async (opts: {
      symbol: string;
      side: string;
      amount: string;
      slippage: string;
      reduceOnly: boolean;
    }) => {
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "create_market_order",
          {
            symbol: opts.symbol,
            amount: opts.amount,
            side: opts.side,
            slippage_percent: opts.slippage,
            reduce_only: opts.reduceOnly,
          },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<OrderResponse>(
          "/orders/create_market",
          signed,
        );
        output(data);
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("limit-order")
  .description("Place a limit order (bid = buy/long, ask = sell/short)")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption("--side <side>", "Order side: bid or ask")
  .requiredOption("--amount <amount>", "Order size as a decimal string")
  .requiredOption("--price <price>", "Limit price as a decimal string")
  .option("--tif <tif>", "Time-in-force: GTC, IOC, ALO, TOB (default GTC)", "GTC")
  .option("--reduce-only", "Only reduce existing position", false)
  .action(
    async (opts: {
      symbol: string;
      side: string;
      amount: string;
      price: string;
      tif: string;
      reduceOnly: boolean;
    }) => {
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const signed = signRequest(
          "create_order",
          {
            symbol: opts.symbol,
            side: opts.side,
            amount: opts.amount,
            price: opts.price,
            tif: opts.tif,
            reduce_only: opts.reduceOnly,
          },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<OrderResponse>("/orders/create", signed);
        output(data);
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("stop-order")
  .description("Place a stop order (triggers when stop-price is reached)")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption("--side <side>", "Order side: bid or ask")
  .requiredOption("--stop-price <price>", "Trigger price as a decimal string")
  .requiredOption("--amount <amount>", "Order size as a decimal string")
  .option("--limit-price <price>", "Limit price after trigger (omit for stop-market)")
  .option("--reduce-only", "Only reduce existing position", true)
  .action(
    async (opts: {
      symbol: string;
      side: string;
      stopPrice: string;
      amount: string;
      limitPrice?: string;
      reduceOnly: boolean;
    }) => {
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const stopOrder: Record<string, unknown> = {
          stop_price: opts.stopPrice,
          amount: opts.amount,
        };
        if (opts.limitPrice) {
          stopOrder.limit_price = opts.limitPrice;
        }
        const signed = signRequest(
          "create_stop_order",
          {
            symbol: opts.symbol,
            side: opts.side,
            reduce_only: opts.reduceOnly,
            stop_order: stopOrder,
          },
          keypair.secretKey,
          config.publicKey,
        );
        const data = await post<OrderResponse>(
          "/orders/stop/create",
          signed,
        );
        output(data);
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("set-tpsl")
  .description("Set take-profit and/or stop-loss on an existing position")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption("--side <side>", "Position side: bid = long, ask = short")
  .option("--tp <price>", "Take-profit trigger price")
  .option("--sl <price>", "Stop-loss trigger price")
  .action(
    async (opts: {
      symbol: string;
      side: string;
      tp?: string;
      sl?: string;
    }) => {
      try {
        if (!opts.tp && !opts.sl) {
          process.stderr.write("Error: Provide at least --tp or --sl\n");
          process.exit(1);
        }
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const data: Record<string, unknown> = {
          symbol: opts.symbol,
          side: opts.side,
        };
        if (opts.tp) data.take_profit = { stop_price: opts.tp };
        if (opts.sl) data.stop_loss = { stop_price: opts.sl };
        const signed = signRequest(
          "set_position_tpsl",
          data,
          keypair.secretKey,
          config.publicKey,
        );
        const result = await post<{ success: boolean }>(
          "/positions/tpsl",
          signed,
        );
        output(result);
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("edit-order")
  .description("Edit an existing order's price and/or amount")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption("--price <price>", "New limit price")
  .requiredOption("--amount <amount>", "New order size")
  .option("--order-id <id>", "Order ID to edit")
  .option("--client-order-id <id>", "Client order ID to edit")
  .action(
    async (opts: {
      symbol: string;
      price: string;
      amount: string;
      orderId?: string;
      clientOrderId?: string;
    }) => {
      try {
        if (!opts.orderId && !opts.clientOrderId) {
          process.stderr.write(
            "Error: Provide either --order-id or --client-order-id\n",
          );
          process.exit(1);
        }
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const data: Record<string, unknown> = {
          symbol: opts.symbol,
          price: opts.price,
          amount: opts.amount,
        };
        if (opts.orderId) data.order_id = Number(opts.orderId);
        if (opts.clientOrderId) data.client_order_id = opts.clientOrderId;
        const signed = signRequest(
          "edit_order",
          data,
          keypair.secretKey,
          config.publicKey,
        );
        const result = await post<OrderResponse>("/orders/edit", signed);
        output(result);
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("cancel")
  .description("Cancel a specific order by ID, or cancel ALL open orders")
  .option("--symbol <symbol>", "Market symbol (required for single cancel)")
  .option("--order-id <id>", "Specific order ID to cancel (omit for cancel-all)")
  .option(
    "--all-symbols",
    "Cancel across all symbols (default true for cancel-all)",
    true,
  )
  .option(
    "--exclude-reduce-only",
    "Exclude reduce-only orders from cancel-all",
    false,
  )
  .action(
    async (opts: {
      symbol?: string;
      orderId?: string;
      allSymbols: boolean;
      excludeReduceOnly: boolean;
    }) => {
      try {
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        if (opts.orderId) {
          const signed = signRequest(
            "cancel_order",
            { symbol: opts.symbol ?? "", order_id: Number(opts.orderId) },
            keypair.secretKey,
            config.publicKey,
          );
          const data = await post<{ success: boolean }>(
            "/orders/cancel",
            signed,
          );
          output(data);
        } else {
          const cancelData: Record<string, unknown> = {
            all_symbols: opts.allSymbols,
            exclude_reduce_only: opts.excludeReduceOnly,
          };
          if (opts.symbol) cancelData.symbol = opts.symbol;
          const signed = signRequest(
            "cancel_all_orders",
            cancelData,
            keypair.secretKey,
            config.publicKey,
          );
          const data = await post<CancelAllResponse>(
            "/orders/cancel_all",
            signed,
          );
          output(data);
        }
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("cancel-stop")
  .description("Cancel a specific stop order")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .option("--order-id <id>", "Stop order ID to cancel")
  .option("--client-order-id <id>", "Client order ID of the stop order")
  .action(
    async (opts: {
      symbol: string;
      orderId?: string;
      clientOrderId?: string;
    }) => {
      try {
        if (!opts.orderId && !opts.clientOrderId) {
          process.stderr.write(
            "Error: Provide either --order-id or --client-order-id\n",
          );
          process.exit(1);
        }
        const config = loadOrCreateWallet();
        const keypair = getKeypair(config);
        const data: Record<string, unknown> = { symbol: opts.symbol };
        if (opts.orderId) data.order_id = Number(opts.orderId);
        if (opts.clientOrderId) data.client_order_id = opts.clientOrderId;
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
        output(result);
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("set-leverage")
  .description("Set the leverage for a market")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption("--leverage <n>", "Leverage multiplier (e.g. 10)")
  .action(async (opts: { symbol: string; leverage: string }) => {
    try {
      const config = loadOrCreateWallet();
      const keypair = getKeypair(config);
      const signed = signRequest(
        "update_leverage",
        { symbol: opts.symbol, leverage: parseInt(opts.leverage, 10) },
        keypair.secretKey,
        config.publicKey,
      );
      const data = await post<{ success: boolean }>(
        "/account/leverage",
        signed,
      );
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("set-margin-mode")
  .description("Switch between cross and isolated margin for a market")
  .requiredOption("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .requiredOption(
    "--isolated <bool>",
    "true = isolated margin, false = cross margin",
  )
  .action(async (opts: { symbol: string; isolated: string }) => {
    try {
      const isIsolated = opts.isolated === "true";
      const config = loadOrCreateWallet();
      const keypair = getKeypair(config);
      const signed = signRequest(
        "update_margin_mode",
        { symbol: opts.symbol, is_isolated: isIsolated },
        keypair.secretKey,
        config.publicKey,
      );
      const data = await post<{ success: boolean }>(
        "/account/margin",
        signed,
      );
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("batch-order")
  .description(
    "Submit a batch of order actions as JSON. Pass a JSON array via --actions.",
  )
  .requiredOption(
    "--actions <json>",
    'JSON array of actions, e.g. \'[{"type":"Create","symbol":"BTC-PERP","side":"bid","amount":"0.001","price":"50000"}]\'',
  )
  .action(async (opts: { actions: string }) => {
    try {
      const actions = JSON.parse(opts.actions) as Array<{
        type: "Create" | "Cancel";
        symbol: string;
        side?: string;
        amount?: string;
        price?: string;
        tif?: string;
        reduce_only?: boolean;
        order_id?: string;
        client_order_id?: string;
      }>;
      const config = loadOrCreateWallet();
      const keypair = getKeypair(config);
      const signedActions = actions.map((action) => {
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
          const data: Record<string, unknown> = { symbol: action.symbol };
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
      output(result);
    } catch (e) {
      fatal(e);
    }
  });

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT MANAGEMENT (4)
// ═══════════════════════════════════════════════════════════════════════════════

program
  .command("withdraw")
  .description("Withdraw funds from your Pacifica account")
  .requiredOption("--amount <amount>", "Amount to withdraw")
  .action(async (opts: { amount: string }) => {
    try {
      const config = loadOrCreateWallet();
      const keypair = getKeypair(config);
      const signed = signRequest(
        "withdraw",
        { amount: opts.amount },
        keypair.secretKey,
        config.publicKey,
      );
      const data = await post<{ success: boolean }>(
        "/account/withdraw",
        signed,
      );
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("create-subaccount")
  .description("Create a new subaccount with a fresh keypair")
  .action(async () => {
    try {
      const config = loadOrCreateWallet();
      const mainKeypair = getKeypair(config);
      const subKeypair = Keypair.generate();
      const subPublicKey = subKeypair.publicKey.toBase58();

      const mainSigned = signRequest(
        "create_subaccount",
        { sub_account: subPublicKey },
        mainKeypair.secretKey,
        config.publicKey,
      );
      const subSigned = signRequest(
        "create_subaccount",
        { sub_account: subPublicKey },
        subKeypair.secretKey,
        subPublicKey,
      );

      const result = await post<{ success: boolean }>(
        "/account/subaccount/create",
        {
          main_account_signature: mainSigned.signature,
          sub_account_signature: subSigned.signature,
          account: config.publicKey,
          sub_account: subPublicKey,
          timestamp: mainSigned.timestamp,
          expiry_window: mainSigned.expiry_window,
        },
      );

      output({
        ...result,
        sub_account_public_key: subPublicKey,
        sub_account_private_key: bs58.encode(subKeypair.secretKey),
        warning:
          "Save the subaccount private key securely — it cannot be recovered.",
      });
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("list-subaccounts")
  .description("List all subaccounts under your main account")
  .action(async () => {
    try {
      const config = loadOrCreateWallet();
      const keypair = getKeypair(config);
      const signed = signRequest(
        "list_subaccounts",
        {},
        keypair.secretKey,
        config.publicKey,
      );
      const data = await post<{ subaccounts: SubaccountInfo[] }>(
        "/account/subaccount/list",
        signed,
      );
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("transfer-funds")
  .description("Transfer funds between main account and a subaccount")
  .requiredOption("--to <address>", "Destination account address")
  .requiredOption("--amount <amount>", "Amount to transfer")
  .action(async (opts: { to: string; amount: string }) => {
    try {
      const config = loadOrCreateWallet();
      const keypair = getKeypair(config);
      const signed = signRequest(
        "subaccount_transfer",
        { to_account: opts.to, amount: opts.amount },
        keypair.secretKey,
        config.publicKey,
      );
      const data = await post<{ success: boolean }>(
        "/account/subaccount/transfer",
        signed,
      );
      output(data);
    } catch (e) {
      fatal(e);
    }
  });

// ═══════════════════════════════════════════════════════════════════════════════
// REAL-TIME (4)
// ═══════════════════════════════════════════════════════════════════════════════

program
  .command("watch")
  .description("Subscribe to a WebSocket channel, collect events for N seconds, then print")
  .requiredOption(
    "--channel <channel>",
    "Channel: prices, trades, orderbook, account_info, account_positions, account_trades",
  )
  .option("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .option("--account <address>", "Wallet address for account_* channels")
  .option("--duration <seconds>", "Seconds to collect (default 10, max 60)", "10")
  .action(
    async (opts: {
      channel: string;
      symbol?: string;
      account?: string;
      duration: string;
    }) => {
      try {
        const { wsManager } = await import("./lib/ws.js");
        const { buildParams, summarizeEvents } = await import("./tools/watch.js");

        const durationSec = Math.max(1, Math.min(60, parseInt(opts.duration, 10)));
        const durationMs = durationSec * 1000;
        const wsParams = buildParams(opts.channel, opts.symbol, opts.account);

        process.stderr.write(
          `Watching ${opts.channel} for ${durationSec}s...\n`,
        );
        const events = await wsManager.snapshot(opts.channel, wsParams, durationMs);
        const summary = summarizeEvents(opts.channel, events, durationMs);

        output({ events, summary });
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("watch-start")
  .description("Start a persistent WebSocket subscription (events are buffered)")
  .requiredOption(
    "--channel <channel>",
    "Channel: prices, trades, orderbook, account_info, account_positions, account_trades",
  )
  .option("--symbol <symbol>", "Market symbol (e.g. BTC-PERP)")
  .option("--account <address>", "Wallet address for account_* channels")
  .action(
    async (opts: {
      channel: string;
      symbol?: string;
      account?: string;
    }) => {
      try {
        const { wsManager } = await import("./lib/ws.js");
        const { buildParams } = await import("./tools/watch.js");

        const wsParams = buildParams(opts.channel, opts.symbol, opts.account);
        const subscriptionId = await wsManager.subscribe(
          opts.channel,
          wsParams,
        );

        output({
          subscription_id: subscriptionId,
          channel: opts.channel,
          message:
            "Subscription started. Use 'pacifica watch-read' to check events.",
        });
      } catch (e) {
        fatal(e);
      }
    },
  );

program
  .command("watch-read")
  .description("Read and drain buffered events from a WebSocket subscription")
  .requiredOption(
    "--subscription-id <id>",
    "Subscription ID from watch-start",
  )
  .action(async (opts: { subscriptionId: string }) => {
    try {
      const { wsManager } = await import("./lib/ws.js");
      const { summarizeEvents } = await import("./tools/watch.js");

      const result = wsManager.read(opts.subscriptionId);
      if (!result) {
        const active = wsManager.listSubscriptions();
        process.stderr.write(
          `Subscription "${opts.subscriptionId}" not found.\n`,
        );
        if (active.length > 0) {
          process.stderr.write(
            `Active subscriptions: ${JSON.stringify(active, null, 2)}\n`,
          );
        }
        process.exit(1);
      }

      const channel = opts.subscriptionId.replace(/_\d+$/, "");
      const summary = summarizeEvents(channel, result.events, result.timeSpanMs);

      output({
        events: result.events,
        count: result.count,
        time_span_ms: result.timeSpanMs,
        summary,
      });
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("watch-stop")
  .description("Stop a WebSocket subscription (or all if no ID given)")
  .option(
    "--subscription-id <id>",
    "Subscription ID to stop (omit to stop all)",
  )
  .action(async (opts: { subscriptionId?: string }) => {
    try {
      const { wsManager } = await import("./lib/ws.js");

      const stopped: string[] = [];
      if (opts.subscriptionId) {
        const ok_ = wsManager.unsubscribe(opts.subscriptionId);
        if (!ok_) {
          const active = wsManager.listSubscriptions();
          process.stderr.write(
            `Subscription "${opts.subscriptionId}" not found.\n`,
          );
          if (active.length > 0) {
            process.stderr.write(
              `Active subscriptions: ${JSON.stringify(active, null, 2)}\n`,
            );
          }
          process.exit(1);
        }
        stopped.push(opts.subscriptionId);
      } else {
        const active = wsManager.listSubscriptions();
        for (const sub of active) {
          wsManager.unsubscribe(sub.id);
          stopped.push(sub.id);
        }
        if (stopped.length === 0) {
          output({ message: "No active subscriptions to stop." });
          return;
        }
      }

      const remaining = wsManager.listSubscriptions();
      output({ stopped, remaining_subscriptions: remaining });
    } catch (e) {
      fatal(e);
    }
  });

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM (2)
// ═══════════════════════════════════════════════════════════════════════════════

program
  .command("wallet")
  .description("Show wallet address, network, and balance")
  .action(async () => {
    try {
      const config = loadOrCreateWallet();
      const info: Record<string, unknown> = {
        publicKey: config.publicKey,
        network: config.network,
      };
      try {
        const account = await get<AccountInfo>("/account", {
          account: config.publicKey,
        });
        info.balance = account.balance;
      } catch {
        info.balance =
          "Unable to fetch (wallet may not be registered on Pacifica yet)";
      }
      output(info);
    } catch (e) {
      fatal(e);
    }
  });

program
  .command("tools")
  .description("List all available CLI commands")
  .action(async () => {
    output(TOOLS_CATALOG);
  });

// ── Parse ────────────────────────────────────────────────────────────────────

program.parseAsync(process.argv).catch((e) => {
  fatal(e);
});
