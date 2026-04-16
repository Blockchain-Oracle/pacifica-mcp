# @pacifica-dev/mcp

MCP server for [Pacifica](https://app.pacifica.fi) — the #1 Solana perps DEX. Gives AI agents the ability to trade, monitor positions, and manage accounts on Pacifica through natural language.

**36 tools. One-line install. All free.**

## Install

### Claude Code

```bash
claude mcp add pacifica npx @pacifica-dev/mcp
```

### Cursor / Windsurf / Claude Desktop / VS Code Copilot

Add to your MCP config:

```json
{
  "mcpServers": {
    "pacifica": {
      "command": "npx",
      "args": ["-y", "@pacifica-dev/mcp"]
    }
  }
}
```

### Gemini CLI

```bash
gemini mcp add pacifica npx -y @pacifica-dev/mcp
```

### Other Hosts

Any MCP-compatible client can use `npx @pacifica-dev/mcp` as the server command.

## What You Can Do

Once installed, talk to your AI agent naturally:

```
"What's the BTC price on Pacifica?"
→ pacifica-prices { symbol: "BTC" }
→ BTC mark: $74,586, funding: +0.0015%, 24h vol: $9.1M

"Show me my open positions"
→ pacifica-positions
→ ETH long 0.2681 @ $2,180.14, unrealized P&L: +$5.32

"Open a 0.01 ETH long at market"
→ pacifica-market-order { symbol: "ETH", side: "bid", amount: "0.01" }
→ Order placed, order_id: 306672002

"Set a stop loss at $2,100 on my ETH position"
→ pacifica-set-tpsl { symbol: "ETH", side: "bid", stop_loss_price: "2100" }

"Watch BTC prices for 10 seconds"
→ pacifica-watch { channel: "prices", symbol: "BTC", duration: 10 }
→ 75 symbols tracked, BTC moved +0.02%
```

## Tools (36)

| Category | Count | Tools |
|----------|-------|-------|
| Market Data | 7 | prices, markets, orderbook, candles, mark-candles, trades, funding-rates |
| Account | 9 | account, settings, positions, trade-history, portfolio, balance-history, orders, order-history, order-by-id |
| Trading | 11 | market-order, limit-order, stop-order, edit-order, batch-order, tpsl, cancel, cancel-stop, leverage, margin-mode, withdraw |
| Subaccounts | 3 | create-subaccount, list-subaccounts, transfer-funds |
| Real-Time | 4 | watch, watch-start, watch-read, watch-stop |
| System | 2 | wallet, tools |

## Configuration

On first run, a Solana wallet is auto-generated at `~/.pacifica-mcp/config.json`. Your private key never leaves your machine.

| Variable | Default | Description |
|----------|---------|-------------|
| `PACIFICA_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `PACIFICA_PRIVATE_KEY` | — | Override wallet (base58 encoded) |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |

## Getting Started on Testnet

1. Install the MCP server (see above)
2. Ask your agent: *"Show my wallet"* — this generates your wallet
3. Go to [test-app.pacifica.fi](https://test-app.pacifica.fi) (access code: `Pacifica`)
4. Deposit testnet funds (SOL, USDC, or other supported assets) via the Pacifica web app
5. Start trading: *"Open a 0.001 BTC long"*

## Architecture

This package is a thin (~30 line) stdio wrapper around [`@pacifica-dev/cli`](https://www.npmjs.com/package/@pacifica-dev/cli), which contains all 36 tool implementations.

## Links

- [@pacifica-dev/mcp on npm](https://www.npmjs.com/package/@pacifica-dev/mcp)
- [@pacifica-dev/cli on npm](https://www.npmjs.com/package/@pacifica-dev/cli)
- [GitHub](https://github.com/Blockchain-Oracle/pacifica-mcp)
- [Pacifica DEX](https://app.pacifica.fi)
- [Pacifica API Docs](https://pacifica.gitbook.io/docs/api-documentation/api)
- [Pacifica Testnet](https://test-app.pacifica.fi)

## License

MIT
