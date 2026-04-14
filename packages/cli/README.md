# @pacifica/cli

CLI and core library for trading on [Pacifica](https://pacifica.fi) -- the #1 Solana perps DEX.

## Install

```bash
npm install -g @pacifica/cli
```

## CLI Usage

```bash
# Market data
pacifica markets
pacifica prices
pacifica orderbook --market SOL-PERP
pacifica candles --market SOL-PERP --resolution 1h

# Account
pacifica account
pacifica positions
pacifica portfolio
pacifica orders

# Trading
pacifica market-order --market SOL-PERP --side buy --size 1
pacifica limit-order --market SOL-PERP --side buy --size 1 --price 150
pacifica cancel --market SOL-PERP --order-id <id>

# Wallet
pacifica wallet
```

Run `pacifica --help` for all 36 commands.

## Library Usage

This package also exports `createMcpServer()` for building MCP server wrappers:

```typescript
import { createMcpServer } from "@pacifica/cli";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = createMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Configuration

On first run, a Solana wallet is auto-generated and saved to `~/.pacifica-mcp/config.json`.

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PACIFICA_PRIVATE_KEY` | Base58 private key (overrides config file) | -- |
| `PACIFICA_NETWORK` | `testnet` or `mainnet` | `testnet` |

## Tools (36)

### Market Data (7)
`markets`, `prices`, `orderbook`, `candles`, `mark-candles`, `recent-trades`, `funding-rates`

### Account Monitoring (9)
`account`, `account-settings`, `positions`, `trade-history`, `portfolio`, `balance-history`, `orders`, `order-history`, `order-by-id`

### Trading (10)
`market-order`, `limit-order`, `stop-order`, `edit-order`, `batch-order`, `tpsl`, `cancel`, `cancel-stop`, `leverage`, `margin-mode`

### Account Management (4)
`withdraw`, `create-subaccount`, `list-subaccounts`, `transfer-funds`

### Real-Time (4)
`watch`, `watch-start`, `watch-read`, `watch-stop`

### System (2)
`wallet`, `tools-list`

## Links

- [Pacifica](https://pacifica.fi)
- [Documentation](https://pacifica.gitbook.io/docs)
- [GitHub](https://github.com/pacifica-fi/pacifica-mcp)

## License

MIT
