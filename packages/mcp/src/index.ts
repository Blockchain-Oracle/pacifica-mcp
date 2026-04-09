#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadOrCreateWallet } from "./lib/wallet.js";
import { logger } from "./lib/logger.js";

// Market Data tools
import { registerMarketsTool } from "./tools/markets.js";
import { registerPricesTool } from "./tools/prices.js";
import { registerOrderbookTool } from "./tools/orderbook.js";
import { registerCandlesTool } from "./tools/candles.js";
import { registerRecentTradesTool } from "./tools/recent-trades.js";
import { registerFundingRatesTool } from "./tools/funding-rates.js";

// Account Monitoring tools
import { registerAccountTool } from "./tools/account.js";
import { registerPositionsTool } from "./tools/positions.js";
import { registerTradeHistoryTool } from "./tools/trade-history.js";
import { registerPortfolioTool } from "./tools/portfolio.js";
import { registerBalanceHistoryTool } from "./tools/balance-history.js";
import { registerOrdersTool } from "./tools/orders.js";
import { registerOrderHistoryTool } from "./tools/order-history.js";

// Trading tools
import { registerMarketOrderTool } from "./tools/market-order.js";
import { registerLimitOrderTool } from "./tools/limit-order.js";
import { registerStopOrderTool } from "./tools/stop-order.js";
import { registerTpslTool } from "./tools/tpsl.js";
import { registerCancelOrderTool } from "./tools/cancel.js";
import { registerLeverageTool } from "./tools/leverage.js";
import { registerMarginModeTool } from "./tools/margin-mode.js";

// System tools
import { registerWalletTool } from "./tools/wallet.js";
import { registerToolsListTool } from "./tools/tools-list.js";

const server = new McpServer(
  { name: "pacifica-mcp", version: "0.1.0" },
  { capabilities: { tools: {}, logging: {} } },
);

// --- Market Data (6) ---
registerMarketsTool(server);
registerPricesTool(server);
registerOrderbookTool(server);
registerCandlesTool(server);
registerRecentTradesTool(server);
registerFundingRatesTool(server);

// --- Account Monitoring (7) ---
registerAccountTool(server);
registerPositionsTool(server);
registerTradeHistoryTool(server);
registerPortfolioTool(server);
registerBalanceHistoryTool(server);
registerOrdersTool(server);
registerOrderHistoryTool(server);

// --- Trading (7) ---
registerMarketOrderTool(server);
registerLimitOrderTool(server);
registerStopOrderTool(server);
registerTpslTool(server);
registerCancelOrderTool(server);
registerLeverageTool(server);
registerMarginModeTool(server);

// --- System (2) ---
registerWalletTool(server);
registerToolsListTool(server);

async function main() {
  loadOrCreateWallet(); // ensure wallet exists on startup
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Pacifica MCP server running");
}

main().catch((error) => {
  logger.error({ err: error }, "Fatal error");
  process.exit(1);
});
