# @pacifica/cli

CLI and core library for trading on [Pacifica](https://app.pacifica.fi) — the #1 Solana perps DEX. 36 tools for market data, trading, account management, and real-time monitoring.

## Install

```bash
npm install -g @pacifica/cli
```

## CLI Usage

### Market Data

```bash
# All market prices
pacifica prices

# Single market
pacifica prices --symbol BTC

# Orderbook depth
pacifica orderbook --symbol ETH

# Candles
pacifica candles --symbol SOL --interval 1h --limit 20

# Funding rates
pacifica funding-rates --symbol BTC --limit 5
```

### Account Monitoring

```bash
# Account overview
pacifica account --account Hwv9DcDacBD3NPGPvkppSQ8bzGQv1AdxfVMF538fh63e

# Open positions
pacifica positions

# Trade history
pacifica trade-history --limit 10

# Portfolio equity curve
pacifica portfolio --time-range 7d

# Open orders
pacifica orders
```

### Trading

```bash
# Market order — bid = long, ask = short
pacifica market-order --symbol ETH --side bid --amount 0.1

# Limit order
pacifica limit-order --symbol BTC --side ask --amount 0.001 --price 80000

# Set stop loss
pacifica set-tpsl --symbol ETH --side bid --sl 2100

# Cancel an order
pacifica cancel --symbol ETH --order-id 306672002

# Cancel all orders
pacifica cancel --all-symbols

# Set leverage
pacifica set-leverage --symbol SOL --leverage 10
```

### Subaccounts

```bash
# Create a subaccount (key saved locally)
pacifica create-subaccount

# List subaccounts
pacifica list-subaccounts

# Transfer funds
pacifica transfer-funds --to <address> --amount 100
```

### Real-Time WebSocket

```bash
# Watch prices for 10 seconds
pacifica watch --channel prices --duration 10

# Watch specific market trades
pacifica watch --channel trades --symbol BTC --duration 5

# Start persistent monitoring
pacifica watch-start --channel account_positions
pacifica watch-read --subscription-id account_positions_1
pacifica watch-stop --subscription-id account_positions_1
```

### Wallet & System

```bash
# Show wallet address, balance, subaccounts
pacifica wallet

# List all commands
pacifica tools

# Full help
pacifica --help
```

## Library Usage

This package also exports `createMcpServer()` for building custom MCP server wrappers:

```typescript
import { createMcpServer } from "@pacifica/cli";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = createMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
```

## All 36 Tools

### Market Data (7)

| Command | Description |
|---------|-------------|
| `markets` | List all perpetual markets with specs |
| `prices` | Real-time mark/oracle prices, funding, OI, volume |
| `orderbook` | Order book bids & asks |
| `candles` | OHLCV candlestick data |
| `mark-candles` | Mark price OHLCV candles |
| `recent-trades` | Recent trades for a market |
| `funding-rates` | Historical funding rate data |

### Account Monitoring (9)

| Command | Description |
|---------|-------------|
| `account` | Balance, equity, margin, positions count |
| `account-settings` | Leverage & margin mode per market |
| `positions` | Open positions with entry price |
| `trade-history` | Historical trades with P&L and fees |
| `portfolio` | Equity history over time |
| `balance-history` | Deposits, withdrawals, funding events |
| `orders` | All open orders |
| `order-history` | Historical orders |
| `order-by-id` | Full event history for a specific order |

### Trading (11)

| Command | Description |
|---------|-------------|
| `market-order` | Place a market order (bid=long, ask=short) |
| `limit-order` | Place a limit order with TIF options |
| `stop-order` | Place a stop order |
| `edit-order` | Edit an existing order's price/amount |
| `batch-order` | Submit up to 10 create/cancel actions |
| `set-tpsl` | Set take-profit / stop-loss |
| `cancel` | Cancel order(s) |
| `cancel-stop` | Cancel a stop order |
| `set-leverage` | Set leverage for a market |
| `set-margin-mode` | Switch cross / isolated margin |
| `withdraw` | Withdraw USDC from Pacifica |

### Subaccounts (3)

| Command | Description |
|---------|-------------|
| `create-subaccount` | Create subaccount (key saved locally) |
| `list-subaccounts` | List all subaccounts |
| `transfer-funds` | Transfer USDC between accounts |

### Real-Time (4)

| Command | Description |
|---------|-------------|
| `watch` | Snapshot: collect data for N seconds |
| `watch-start` | Start persistent background subscription |
| `watch-read` | Read buffered events |
| `watch-stop` | Stop a subscription |

### System (2)

| Command | Description |
|---------|-------------|
| `wallet` | Wallet address, balance, subaccounts |
| `tools` | List all available commands |

## Configuration

On first run, a Solana wallet is auto-generated at `~/.pacifica-mcp/config.json` (mode `0600`). Subaccount keys are saved to `~/.pacifica-mcp/subaccounts/`. Private keys never leave your machine.

| Variable | Default | Description |
|----------|---------|-------------|
| `PACIFICA_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `PACIFICA_PRIVATE_KEY` | — | Override wallet (base58) |
| `LOG_LEVEL` | `info` | Logging level |

## Links

- [GitHub](https://github.com/Blockchain-Oracle/pacifica-mcp)
- [Pacifica DEX](https://app.pacifica.fi)
- [Pacifica Testnet](https://test-app.pacifica.fi) (access code: `Pacifica`)
- [API Docs](https://pacifica.gitbook.io/docs/api-documentation/api)

## License

MIT
