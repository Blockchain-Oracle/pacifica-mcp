export type ToolCategory = "market-data" | "account" | "trading" | "system"

export interface Tool {
  name: string
  title: string
  description: string
  category: ToolCategory
  requiresWallet: boolean
  prompt: string
}

export const tools: Tool[] = [
  // ── Market Data ──────────────────────────────────────
  {
    name: "pacifica-markets",
    title: "Markets Info",
    description: "List all perpetual markets on Pacifica, or look up a single market by symbol — tick size, max leverage, lot size.",
    category: "market-data",
    requiresWallet: false,
    prompt: "List all available markets on Pacifica and show their max leverage",
  },
  {
    name: "pacifica-prices",
    title: "Market Prices",
    description: "Real-time mark price, oracle price, funding rate, next funding time, open interest, and 24h volume.",
    category: "market-data",
    requiresWallet: false,
    prompt: "What is the current mark price and funding rate for BTC-PERP on Pacifica?",
  },
  {
    name: "pacifica-orderbook",
    title: "Order Book",
    description: "Live bids and asks for any Pacifica perpetual market with configurable aggregation levels.",
    category: "market-data",
    requiresWallet: false,
    prompt: "Show me the top 10 bids and asks for ETH-PERP on Pacifica",
  },
  {
    name: "pacifica-candles",
    title: "Candlestick Data",
    description: "OHLCV candlestick data based on trade price for any market and interval: 1m, 5m, 15m, 1h, 4h, 1d, and more.",
    category: "market-data",
    requiresWallet: false,
    prompt: "Get hourly OHLCV candles for BTC-PERP over the last 24 hours",
  },
  {
    name: "pacifica-mark-candles",
    title: "Mark Price Candles",
    description: "OHLCV candlestick data based on the mark price — useful for liquidation analysis and funding rate strategy.",
    category: "market-data",
    requiresWallet: false,
    prompt: "Get 4h mark price candles for ETH-PERP for the past week",
  },
  {
    name: "pacifica-recent-trades",
    title: "Recent Trades",
    description: "Latest trades for a market — price, size, side, and cause for each fill.",
    category: "market-data",
    requiresWallet: false,
    prompt: "Show the most recent trades for SOL-PERP on Pacifica",
  },
  {
    name: "pacifica-funding-rates",
    title: "Funding Rate History",
    description: "Historical funding rates for any Pacifica market — useful for carry analysis.",
    category: "market-data",
    requiresWallet: false,
    prompt: "Show the funding rate history for BTC-PERP over the last 7 days",
  },

  // ── Account ───────────────────────────────────────────
  {
    name: "pacifica-account",
    title: "Account Overview",
    description: "Account balance, equity, margin used, position count, and fee level. Uses your MCP wallet if no address provided.",
    category: "account",
    requiresWallet: false,
    prompt: "Show my Pacifica account balance and available margin",
  },
  {
    name: "pacifica-account-settings",
    title: "Account Settings",
    description: "Get account settings including margin mode and leverage per market.",
    category: "account",
    requiresWallet: false,
    prompt: "Show my account settings and leverage for each market on Pacifica",
  },
  {
    name: "pacifica-positions",
    title: "Open Positions",
    description: "All open positions with symbol, side, amount, entry price, margin, unrealized PnL, and funding.",
    category: "account",
    requiresWallet: false,
    prompt: "What are my current open positions on Pacifica?",
  },
  {
    name: "pacifica-orders",
    title: "Open Orders",
    description: "All open limit and stop orders for your account, with status and fill amounts.",
    category: "account",
    requiresWallet: false,
    prompt: "Show all my open orders on Pacifica",
  },
  {
    name: "pacifica-order-history",
    title: "Order History",
    description: "Historical orders for an account — filled, cancelled, and expired orders.",
    category: "account",
    requiresWallet: false,
    prompt: "Show my order history for BTC-PERP on Pacifica",
  },
  {
    name: "pacifica-order-by-id",
    title: "Order History By ID",
    description: "Get the full event history for a specific order by its order_id — all state changes from create to fill/cancel.",
    category: "account",
    requiresWallet: false,
    prompt: "Show me the full history for order ID 12345 on Pacifica",
  },
  {
    name: "pacifica-trade-history",
    title: "Trade History",
    description: "Historical trades with realized PnL and fees — full execution audit trail.",
    category: "account",
    requiresWallet: false,
    prompt: "Show my trade history with PnL for this week on Pacifica",
  },
  {
    name: "pacifica-portfolio",
    title: "Portfolio Equity History",
    description: "Portfolio equity curve over time — useful for tracking performance and drawdown.",
    category: "account",
    requiresWallet: false,
    prompt: "Show my portfolio equity history over the past 30 days",
  },
  {
    name: "pacifica-balance-history",
    title: "Balance History",
    description: "Balance events: deposits, withdrawals, trade fills, and funding payments.",
    category: "account",
    requiresWallet: false,
    prompt: "Show my balance history including deposits and withdrawals",
  },

  // ── Trading ───────────────────────────────────────────
  {
    name: "pacifica-market-order",
    title: "Market Order",
    description: "Place a market order. bid = buy/long, ask = sell/short. Executes immediately at best available price.",
    category: "trading",
    requiresWallet: true,
    prompt: "Place a market buy order for 0.1 BTC on BTC-PERP at 10x leverage",
  },
  {
    name: "pacifica-limit-order",
    title: "Limit Order",
    description: "Place a limit order with TIF options: GTC, IOC, ALO (add-liquidity-only), TOB (top-of-book).",
    category: "trading",
    requiresWallet: true,
    prompt: "Place a limit buy order for 0.1 ETH on ETH-PERP at $3000 GTC",
  },
  {
    name: "pacifica-stop-order",
    title: "Stop Order",
    description: "Place a stop-market or stop-limit order that triggers when price reaches your stop level.",
    category: "trading",
    requiresWallet: true,
    prompt: "Place a stop-market sell order for my BTC position if price drops to $60000",
  },
  {
    name: "pacifica-edit-order",
    title: "Edit Order",
    description: "Edit an existing order's price and/or amount by order_id or client_order_id.",
    category: "trading",
    requiresWallet: true,
    prompt: "Edit my ETH-PERP limit order to change the price to $3200",
  },
  {
    name: "pacifica-batch-order",
    title: "Batch Orders",
    description: "Place or cancel multiple orders in a single signed request — up to 10 actions.",
    category: "trading",
    requiresWallet: true,
    prompt: "Place a limit buy at $3000 and a limit sell at $3500 for ETH-PERP in one batch",
  },
  {
    name: "pacifica-set-tpsl",
    title: "Take-Profit / Stop-Loss",
    description: "Set take-profit and/or stop-loss prices on an existing position — one call, both levels.",
    category: "trading",
    requiresWallet: true,
    prompt: "Set take-profit at $100000 and stop-loss at $80000 for my BTC-PERP long",
  },
  {
    name: "pacifica-cancel-order",
    title: "Cancel Order(s)",
    description: "Cancel a specific order by ID, or cancel ALL open orders for a symbol in one call.",
    category: "trading",
    requiresWallet: true,
    prompt: "Cancel all my open orders on ETH-PERP",
  },
  {
    name: "pacifica-cancel-stop",
    title: "Cancel Stop Order",
    description: "Cancel a specific stop order by order_id or client_order_id.",
    category: "trading",
    requiresWallet: true,
    prompt: "Cancel my BTC-PERP stop order with ID 99999",
  },
  {
    name: "pacifica-set-leverage",
    title: "Set Leverage",
    description: "Set leverage for a market before opening a position — up to the market's maximum.",
    category: "trading",
    requiresWallet: true,
    prompt: "Set leverage to 20x for BTC-PERP",
  },
  {
    name: "pacifica-set-margin-mode",
    title: "Set Margin Mode",
    description: "Switch between cross margin (shared pool) and isolated margin (per-position risk) for a market.",
    category: "trading",
    requiresWallet: true,
    prompt: "Switch BTC-PERP to isolated margin mode",
  },
  {
    name: "pacifica-transfer-funds",
    title: "Transfer Funds",
    description: "Transfer funds between your main account and a subaccount.",
    category: "trading",
    requiresWallet: true,
    prompt: "Transfer 100 USDC to my subaccount on Pacifica",
  },
  {
    name: "pacifica-withdraw",
    title: "Withdraw Funds",
    description: "Withdraw funds from your Pacifica account back to your Solana wallet.",
    category: "trading",
    requiresWallet: true,
    prompt: "Withdraw 500 USDC from my Pacifica account to my Solana wallet",
  },

  // ── System ────────────────────────────────────────────
  {
    name: "pacifica-wallet",
    title: "Wallet Info",
    description: "Show your Pacifica MCP wallet address, connected network (testnet/mainnet), and account balance.",
    category: "system",
    requiresWallet: false,
    prompt: "Show my Pacifica MCP wallet address and balance",
  },
  {
    name: "pacifica-tools",
    title: "List Tools",
    description: "List all available Pacifica MCP tools grouped by category — discover what the server can do.",
    category: "system",
    requiresWallet: false,
    prompt: "List all available Pacifica MCP tools",
  },
  {
    name: "pacifica-create-subaccount",
    title: "Create Subaccount",
    description: "Create a new subaccount under your main Pacifica account. Generates a fresh Ed25519 keypair for the subaccount.",
    category: "system",
    requiresWallet: true,
    prompt: "Create a new subaccount on Pacifica for isolated strategy trading",
  },
  {
    name: "pacifica-list-subaccounts",
    title: "List Subaccounts",
    description: "List all subaccounts under your main Pacifica account with balances and fee levels.",
    category: "system",
    requiresWallet: true,
    prompt: "List all my Pacifica subaccounts and their balances",
  },
]

export const categoryLabel: Record<ToolCategory, string> = {
  "market-data": "Market Data",
  account: "Account",
  trading: "Trading",
  system: "System",
}

export const categoryDescription: Record<ToolCategory, string> = {
  "market-data": "Free · cached 5 min",
  account: "Free · no auth required",
  trading: "Requires wallet · signed",
  system: "Free / wallet · utility",
}
