# Pacifica MCP

MCP server giving AI agents the ability to trade, monitor, and manage positions on **Pacifica** — the #1 Solana perps DEX. 36 tools covering the entire Pacifica API. One-line install.

Built for the **Pacifica Hackathon** (Track 1: Trading Applications & Bots).

## Quick Start

Pacifica MCP ships in three flavours: **MCP server**, **standalone CLI**, and **cross-client Agent Skill**.

### MCP Server

```bash
# Claude Code
claude mcp add pacifica npx @pacifica-dev/mcp

# Gemini CLI
gemini mcp add pacifica npx -y @pacifica-dev/mcp

# Cursor / Windsurf / Claude Desktop / VS Code / Zed / Cline / Goose
# Add to the client's MCP config:
#   { "command": "npx", "args": ["-y", "@pacifica-dev/mcp"] }
```

### Standalone CLI

```bash
npm install -g @pacifica-dev/cli
pacifica --help
```

### Agent Skill

```bash
# Paste into any agent
Read https://pacifica-mcp.xyz/skill.md and follow the instructions to install Pacifica MCP.

# Or via CLI
pnpm dlx skills add github:Blockchain-Oracle/pacifica-mcp --skill pacifica
```

On first run, Pacifica MCP generates a Solana wallet at `~/.pacifica-mcp/config.json`. The private key never leaves your machine.

To trade, deposit funds on Pacifica testnet: [test-app.pacifica.fi](https://test-app.pacifica.fi) (access code: `Pacifica`).

## What This Does

Pacifica MCP gives AI agents access to **36 tools** covering the entire Pacifica REST + WebSocket API. All tools are free. No API keys needed. No accounts to create.

Works with every major agent client (Claude Code, Claude Desktop, Cursor, Windsurf, VS Code Copilot, Gemini CLI, Zed, Continue, Cline, Goose) and as a standalone `pacifica` CLI for direct terminal use.

## Tools

### Market Data (free, no wallet needed)

| Tool | What it does |
| --- | --- |
| `pacifica-markets` | List all perpetual markets with specs |
| `pacifica-prices` | Real-time mark/oracle prices, funding rates, OI, volume |
| `pacifica-orderbook` | Order book depth (bids & asks) |
| `pacifica-candles` | OHLCV candlestick data |
| `pacifica-mark-candles` | Mark price OHLCV candles |
| `pacifica-recent-trades` | Recent trades for a market |
| `pacifica-funding-rates` | Historical funding rate data |

### Account Monitoring (free, no wallet needed — just an address)

| Tool | What it does |
| --- | --- |
| `pacifica-account` | Balance, equity, margin, positions count |
| `pacifica-account-settings` | Leverage & margin mode per market |
| `pacifica-positions` | All open positions with entry price & P&L |
| `pacifica-trade-history` | Historical trades with P&L and fees |
| `pacifica-portfolio` | Equity history curve over time |
| `pacifica-balance-history` | Balance events (deposits, withdrawals, funding) |
| `pacifica-orders` | All open orders |
| `pacifica-order-history` | Historical orders |
| `pacifica-order-by-id` | Full event history for a specific order |

### Trading (requires wallet — Ed25519 signing)

| Tool | What it does |
| --- | --- |
| `pacifica-market-order` | Place a market order (bid=long, ask=short) |
| `pacifica-limit-order` | Place a limit order with TIF options |
| `pacifica-stop-order` | Place a stop order |
| `pacifica-edit-order` | Edit an existing order's price/amount |
| `pacifica-batch-order` | Submit up to 10 create/cancel actions |
| `pacifica-set-tpsl` | Set take-profit / stop-loss on a position |
| `pacifica-cancel-order` | Cancel a specific order or all orders |
| `pacifica-cancel-stop` | Cancel a specific stop order |
| `pacifica-set-leverage` | Set leverage for a market |
| `pacifica-set-margin-mode` | Switch between cross and isolated margin |
| `pacifica-withdraw` | Withdraw USDC from Pacifica |

### Subaccount Management (requires wallet)

| Tool | What it does |
| --- | --- |
| `pacifica-create-subaccount` | Create a new subaccount (key saved locally) |
| `pacifica-list-subaccounts` | List all subaccounts (on-chain + local) |
| `pacifica-transfer-funds` | Transfer USDC between accounts |

### Real-Time WebSocket

| Tool | What it does |
| --- | --- |
| `pacifica-watch` | Snapshot: collect real-time data for N seconds |
| `pacifica-watch-start` | Start a persistent background subscription |
| `pacifica-watch-read` | Read buffered events from a subscription |
| `pacifica-watch-stop` | Stop a subscription |

### System

| Tool | What it does |
| --- | --- |
| `pacifica-wallet` | Show wallet address, balance, subaccounts |
| `pacifica-tools` | List all available tools |

## Agent Skill

Pacifica MCP also ships as an Agent Skill — procedural instructions that teach AI agents when and how to use the tools. Three install methods:

```bash
# 1. Via the community skills CLI
pnpm dlx skills add github:Blockchain-Oracle/pacifica-mcp --skill pacifica

# 2. Via prompt — paste into any agent
Read https://pacifica-mcp.xyz/skill.md and follow the instructions.

# 3. Manual — copy SKILL.md to ~/.claude/skills/pacifica/
```

The skill teaches your agent the decision tree (user intent → tool), parameter guidance (bid=long, ask=short), error handling, and CLI fallback.

## Standalone CLI

Same tools, terminal interface. No MCP host needed.

```bash
npm install -g @pacifica-dev/cli

pacifica wallet
pacifica prices --symbol BTC
pacifica positions --account Hwv9DcDacBD3NPGPvkppSQ8bzGQv1AdxfVMF538fh63e
pacifica market-order --symbol ETH --side bid --amount 0.01
pacifica watch --channel prices --duration 5
pacifica --help
```

## Real-Time Monitoring

The WebSocket tools let agents monitor markets and positions in real-time:

```
"Watch BTC prices for 10 seconds"
→ pacifica-watch --channel prices --symbol BTC --duration 10
→ 75 symbols tracked, BTC moved from $74,586 to $74,602 (+0.02%)

"Start monitoring my positions in the background"
→ pacifica-watch-start --channel account_positions --account Hwv9...
→ subscription_id: "account_positions_1"

"Any position changes?"
→ pacifica-watch-read --subscription-id account_positions_1
→ 3 events: ETH position size changed, new SOL position opened

"Stop monitoring"
→ pacifica-watch-stop --subscription-id account_positions_1
```

## Architecture

```
packages/
  cli/     @pacifica-dev/cli    — 36 tools, API client, Ed25519 signing, wallet, WebSocket
  mcp/     @pacifica-dev/mcp    — Thin MCP stdio wrapper (imports from cli)
  skills/  Agent Skill       — SKILL.md for cross-client install
  web/     Landing page      — Next.js tool explorer + install instructions
  docs/    Documentation     — Nextra docs site
```

The MCP package is a thin ~30 line wrapper. All tool logic lives in `@pacifica-dev/cli`, which exports a `createMcpServer()` factory. This split ensures `npx @pacifica-dev/mcp` works cleanly across all MCP hosts.

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PACIFICA_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `PACIFICA_PRIVATE_KEY` | — | Override auto-generated wallet (base58) |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |

## Security

- Ed25519 signing for all write operations (Solana native)
- Private keys stored locally at `~/.pacifica-mcp/config.json` with `0o600` permissions
- Subaccount keys saved to `~/.pacifica-mcp/subaccounts/` — never exposed through AI context
- No API keys needed — Pacifica's public endpoints require no authentication for reads

## Development

```bash
pnpm install
pnpm dev:mcp     # MCP server with tsx watch
pnpm dev:cli     # CLI with tsx watch
pnpm dev:web     # Landing page on :3002
pnpm dev:docs    # Documentation on :3001
pnpm test        # Run all tests (21 tests)
pnpm build       # Build all packages
```

## Links

**npm Packages:**
- [@pacifica-dev/mcp](https://www.npmjs.com/package/@pacifica-dev/mcp) — MCP server
- [@pacifica-dev/cli](https://www.npmjs.com/package/@pacifica-dev/cli) — Standalone CLI

**Pacifica:**
- [Pacifica DEX](https://app.pacifica.fi)
- [Pacifica Testnet](https://test-app.pacifica.fi) (access code: `Pacifica`)
- [Pacifica API Docs](https://pacifica.gitbook.io/docs/api-documentation/api)
- [Pacifica Hackathon](https://pacifica.gitbook.io/docs/hackathon/pacifica-hackathon)

**Project:**
- [GitHub](https://github.com/Blockchain-Oracle/pacifica-mcp)

## License

MIT
