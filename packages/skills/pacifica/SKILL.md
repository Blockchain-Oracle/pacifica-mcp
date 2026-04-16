---
name: pacifica
description: Live market data and trading actions for Pacifica — the #1 perpetuals DEX on Solana. Use this skill when the user asks about crypto perps, positions, orders, funding rates, or wants to trade on Pacifica. Available as MCP (tools prefixed `mcp__pacifica__*`). Skip for general knowledge, math, code, or explanations answerable from training data.
---

# Pacifica MCP Skill

## When to Use

Trigger this skill when the user:
- Asks about crypto prices, perps, or trading on Pacifica / Solana
- Wants to check their trading account, positions, or open orders
- Wants to place, modify, or cancel trades
- Wants market data (orderbooks, candles, funding rates, recent trades)
- Mentions BTC-PERP, ETH-PERP, SOL-PERP, or any other perpetual contract

## When NOT to Use

Skip this skill for:
- General knowledge questions ("What is a perpetual contract?")
- Math or computation ("What's 10x leverage on $1000?")
- Questions answerable from training data alone
- Summarizing content the user already pasted

## Tool Selection Decision Tree

1. "What's the price of X?" → `pacifica-prices` with symbol X
2. "Show my positions / account" → `pacifica-positions` or `pacifica-account`
3. "Open a long / buy X" → `pacifica-market-order` with side "bid"
4. "Open a short / sell X" → `pacifica-market-order` with side "ask"
5. "Place a limit order" → `pacifica-limit-order`
6. "Set stop loss / take profit" → `pacifica-set-tpsl`
7. "Cancel my order" → `pacifica-cancel-order`
8. "Show the orderbook" → `pacifica-orderbook`
9. "What are funding rates?" → `pacifica-funding-rates`
10. "Show OHLCV candles" → `pacifica-candles` (trade price) or `pacifica-mark-candles` (mark price)
11. "Show recent trades" → `pacifica-recent-trades`
12. "What markets are available?" → `pacifica-markets`
13. "Show my order history" → `pacifica-order-history`
14. "Show my trade history / PnL" → `pacifica-trade-history`
15. "Show my equity curve" → `pacifica-portfolio`
16. "Show my deposits / withdrawals" → `pacifica-balance-history`
17. "What's my wallet address?" → `pacifica-wallet`
18. "Set leverage" → `pacifica-set-leverage`
19. "Switch to isolated / cross margin" → `pacifica-set-margin-mode`
20. "Place a stop order" → `pacifica-stop-order`
21. "Edit my order" → `pacifica-edit-order`
22. "Cancel stop order" → `pacifica-cancel-stop`
23. "Place multiple orders at once" → `pacifica-batch-order`
24. "Get order details by ID" → `pacifica-order-by-id`
25. "Account settings / leverage per market" → `pacifica-account-settings`
26. "Create subaccount" → `pacifica-create-subaccount`
27. "List subaccounts" → `pacifica-list-subaccounts`
28. "Transfer funds to subaccount" → `pacifica-transfer-funds`
29. "Withdraw funds" → `pacifica-withdraw`
30. "Open orders for my account" → `pacifica-orders`
31. "What tools are available?" → `pacifica-tools`

## Parameter Guide

- **symbol**: Use uppercase with `-PERP` suffix — e.g. `BTC-PERP`, `ETH-PERP`, `SOL-PERP`
- **side**: `"bid"` = long/buy, `"ask"` = short/sell
- **amount**: Always a string (e.g. `"0.1"`, `"1.5"`)
- **price**: Always a string (e.g. `"70000"`, `"3500"`)
- **tif**: `GTC` (default, good-til-cancelled), `IOC` (immediate-or-cancel), `ALO` (add-liquidity-only / post-only), `TOB` (top-of-book)
- **interval**: `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `8h`, `12h`, `1d`

## Free vs Wallet-Required Tools

**Free (no auth):** markets, prices, orderbook, candles, mark-candles, recent-trades, funding-rates, account, positions, orders, order-history, trade-history, portfolio, balance-history, order-by-id, account-settings, wallet, tools

**Requires wallet (signed):** market-order, limit-order, stop-order, set-tpsl, cancel-order, cancel-stop, edit-order, batch-order, set-leverage, set-margin-mode, create-subaccount, list-subaccounts, transfer-funds, withdraw

## Error Handling

- **404 on account**: User hasn't deposited on Pacifica yet — direct them to https://test-app.pacifica.fi (testnet) or https://pacifica.fi (mainnet)
- **429 rate limited**: Back off and retry after a moment
- **Signing errors**: Check that the wallet key is set (`pacifica-wallet` to verify)
- **"Account not found"**: User needs to connect and deposit on Pacifica first

## Example Workflows

### Check price and open a long
```
User: "Open a 0.1 BTC long on 10x leverage"

1. pacifica-prices (symbol: "BTC-PERP") — check current mark price
2. pacifica-set-leverage (symbol: "BTC-PERP", leverage: 10) — set leverage
3. pacifica-market-order (symbol: "BTC-PERP", side: "bid", amount: "0.1") — place order
```

### Set risk management on an existing position
```
User: "Set TP at $100k and SL at $80k for my BTC long"

1. pacifica-positions — verify position exists
2. pacifica-set-tpsl (symbol: "BTC-PERP", take_profit: "100000", stop_loss: "80000")
```

### Portfolio review
```
User: "How's my account doing?"

1. pacifica-account — equity, margin, PnL summary
2. pacifica-positions — open positions breakdown
3. pacifica-portfolio — equity curve (optional)
```

## Install

```bash
# MCP server (Claude Code, Cursor, Windsurf, VS Code Copilot, etc.)
claude mcp add pacifica npx @pacifica-dev/mcp

# Standalone CLI
npm install -g @pacifica-dev/cli
```
