import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadOrCreateWallet } from "./lib/wallet.js";
import { logger } from "./lib/logger.js";

// Market Data tools
import { registerMarketsTool } from "./tools/markets.js";
import { registerPricesTool } from "./tools/prices.js";
import { registerOrderbookTool } from "./tools/orderbook.js";
import { registerCandlesTool } from "./tools/candles.js";
import { registerMarkCandlesTool } from "./tools/mark-candles.js";
import { registerRecentTradesTool } from "./tools/recent-trades.js";
import { registerFundingRatesTool } from "./tools/funding-rates.js";

// Account Monitoring tools
import { registerAccountTool } from "./tools/account.js";
import { registerAccountSettingsTool } from "./tools/account-settings.js";
import { registerPositionsTool } from "./tools/positions.js";
import { registerTradeHistoryTool } from "./tools/trade-history.js";
import { registerPortfolioTool } from "./tools/portfolio.js";
import { registerBalanceHistoryTool } from "./tools/balance-history.js";
import { registerOrdersTool } from "./tools/orders.js";
import { registerOrderHistoryTool } from "./tools/order-history.js";
import { registerOrderByIdTool } from "./tools/order-by-id.js";

// Trading tools
import { registerMarketOrderTool } from "./tools/market-order.js";
import { registerLimitOrderTool } from "./tools/limit-order.js";
import { registerStopOrderTool } from "./tools/stop-order.js";
import { registerEditOrderTool } from "./tools/edit-order.js";
import { registerBatchOrderTool } from "./tools/batch-order.js";
import { registerTpslTool } from "./tools/tpsl.js";
import { registerCancelOrderTool } from "./tools/cancel.js";
import { registerCancelStopTool } from "./tools/cancel-stop.js";
import { registerLeverageTool } from "./tools/leverage.js";
import { registerMarginModeTool } from "./tools/margin-mode.js";
import { registerWithdrawTool } from "./tools/withdraw.js";

// Subaccount tools
import { registerCreateSubaccountTool } from "./tools/create-subaccount.js";
import { registerListSubaccountsTool } from "./tools/list-subaccounts.js";
import { registerTransferFundsTool } from "./tools/transfer-funds.js";

// Real-Time tools
import { registerWatchTool } from "./tools/watch.js";
import { registerWatchStartTool } from "./tools/watch-start.js";
import { registerWatchReadTool } from "./tools/watch-read.js";
import { registerWatchStopTool } from "./tools/watch-stop.js";

// System tools
import { registerWalletTool } from "./tools/wallet.js";
import { registerToolsListTool } from "./tools/tools-list.js";

export function createMcpServer(): McpServer {
  loadOrCreateWallet(); // ensure wallet exists on startup

  const server = new McpServer(
    { name: "pacifica-mcp", version: "0.1.0" },
    { capabilities: { tools: {}, logging: {} } },
  );

  // --- Market Data (7) ---
  registerMarketsTool(server);
  registerPricesTool(server);
  registerOrderbookTool(server);
  registerCandlesTool(server);
  registerMarkCandlesTool(server);
  registerRecentTradesTool(server);
  registerFundingRatesTool(server);

  // --- Account Monitoring (9) ---
  registerAccountTool(server);
  registerAccountSettingsTool(server);
  registerPositionsTool(server);
  registerTradeHistoryTool(server);
  registerPortfolioTool(server);
  registerBalanceHistoryTool(server);
  registerOrdersTool(server);
  registerOrderHistoryTool(server);
  registerOrderByIdTool(server);

  // --- Trading (10) ---
  registerMarketOrderTool(server);
  registerLimitOrderTool(server);
  registerStopOrderTool(server);
  registerEditOrderTool(server);
  registerBatchOrderTool(server);
  registerTpslTool(server);
  registerCancelOrderTool(server);
  registerCancelStopTool(server);
  registerLeverageTool(server);
  registerMarginModeTool(server);

  // --- Account Management (4) ---
  registerWithdrawTool(server);
  registerCreateSubaccountTool(server);
  registerListSubaccountsTool(server);
  registerTransferFundsTool(server);

  // --- Real-Time (4) ---
  registerWatchTool(server);
  registerWatchStartTool(server);
  registerWatchReadTool(server);
  registerWatchStopTool(server);

  // --- System (2) ---
  registerWalletTool(server);
  registerToolsListTool(server);

  logger.info("Pacifica MCP server created with 36 tools");
  return server;
}
