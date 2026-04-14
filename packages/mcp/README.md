# @pacifica/mcp

MCP (Model Context Protocol) server for [Pacifica](https://pacifica.fi) -- the #1 Solana perps DEX.

Gives AI agents like Claude, GPT, and Cursor the ability to trade, monitor positions, and manage accounts on Pacifica.

## Quick Start

Add to Claude Desktop, Cursor, or any MCP host:

```bash
npx @pacifica/mcp
```

### Claude Desktop

```json
{
  "mcpServers": {
    "pacifica": {
      "command": "npx",
      "args": ["@pacifica/mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add pacifica npx @pacifica/mcp
```

## What It Does

36 tools across 6 categories:

- **Market Data** -- prices, orderbook, candles, funding rates, recent trades
- **Account Monitoring** -- positions, balances, portfolio, trade history
- **Trading** -- market/limit/stop orders, TP/SL, batch orders, cancel
- **Account Management** -- leverage, margin mode, withdraw
- **Subaccounts** -- create, list, transfer funds
- **Real-Time** -- WebSocket streaming for prices, trades, positions

## Configuration

On first run, a Solana wallet is auto-generated and saved to `~/.pacifica-mcp/config.json`.

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PACIFICA_PRIVATE_KEY` | Base58 private key (overrides config file) | -- |
| `PACIFICA_NETWORK` | `testnet` or `mainnet` | `testnet` |

## Architecture

This package is a thin stdio wrapper around [`@pacifica/cli`](https://www.npmjs.com/package/@pacifica/cli), which contains all tool implementations.

## Links

- [Pacifica](https://pacifica.fi)
- [Documentation](https://pacifica.gitbook.io/docs)
- [GitHub](https://github.com/pacifica-fi/pacifica-mcp)

## License

MIT
