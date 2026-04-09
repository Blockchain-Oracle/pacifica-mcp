import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ok } from "../lib/format.js";
import { logger } from "../lib/logger.js";

const TOOLS = {
  "Market Data (free, cached)": [
    { name: "pacifica-markets", description: "List all markets or look up a single market" },
    { name: "pacifica-prices", description: "Real-time prices, funding, open interest, volume" },
    { name: "pacifica-orderbook", description: "Order book bids and asks" },
    { name: "pacifica-candles", description: "OHLCV candlestick data" },
    { name: "pacifica-recent-trades", description: "Recent trades for a market" },
    { name: "pacifica-funding-rates", description: "Historical funding rates" },
  ],
  "Account Monitoring (free, cached)": [
    { name: "pacifica-account", description: "Account overview: balance, equity, margin" },
    { name: "pacifica-positions", description: "Open positions with entry price and PnL" },
    { name: "pacifica-trade-history", description: "Historical trades with PnL and fees" },
    { name: "pacifica-portfolio", description: "Portfolio equity history over time" },
    { name: "pacifica-balance-history", description: "Balance events: deposits, withdrawals, funding" },
    { name: "pacifica-orders", description: "All open orders" },
    { name: "pacifica-order-history", description: "Historical orders" },
  ],
  "Trading (requires wallet, signed)": [
    { name: "pacifica-market-order", description: "Place a market order (bid=long, ask=short)" },
    { name: "pacifica-limit-order", description: "Place a limit order with TIF options" },
    { name: "pacifica-stop-order", description: "Place a stop order (stop-market or stop-limit)" },
    { name: "pacifica-set-tpsl", description: "Set take-profit and/or stop-loss on a position" },
    { name: "pacifica-cancel-order", description: "Cancel a specific order or all open orders" },
    { name: "pacifica-set-leverage", description: "Set leverage for a market" },
    { name: "pacifica-set-margin-mode", description: "Switch between cross and isolated margin" },
  ],
  "System": [
    { name: "pacifica-wallet", description: "Show wallet address, network, and balance" },
    { name: "pacifica-tools", description: "This tool — list all available tools" },
  ],
};

export function registerToolsListTool(server: McpServer): void {
  server.registerTool(
    "pacifica-tools",
    {
      title: "Available Tools",
      description:
        "List all available Pacifica MCP tools grouped by category.\n\nNo parameters required.",
      inputSchema: z.object({}),
    },
    async () => {
      logger.debug("pacifica-tools invoked");
      return ok(TOOLS);
    },
  );
}
