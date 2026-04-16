<p align="center">
  <img src="https://raw.githubusercontent.com/Blockchain-Oracle/pacifica-mcp/main/assets/pacifica-mcp-header.svg" alt="Pacifica MCP — AI-Powered Trading on Solana" width="100%"/>
</p>

<h1 align="center">Pacifica MCP</h1>

<p align="center">
  <strong>We built the infrastructure layer that lets ANY AI agent trade on Pacifica. Instead of building one bot, we built the tools that let you build any bot — through natural language.</strong>
</p>

---

## Try it

| | |
| :--- | :--- |
| **Demo video** | [youtu.be/vPk1GxwZVUw](https://youtu.be/vPk1GxwZVUw) |
| **Landing page** | [pacifica-mcp.xyz](https://pacifica-mcp.xyz) |
| **Documentation** | [docs.pacifica-mcp.xyz](https://docs.pacifica-mcp.xyz) |
| **Source code** | [github.com/Blockchain-Oracle/pacifica-mcp](https://github.com/Blockchain-Oracle/pacifica-mcp) |
| **npm — MCP server** | [`@pacifica-dev/mcp`](https://www.npmjs.com/package/@pacifica-dev/mcp) `v0.1.7` |
| **npm — CLI** | [`@pacifica-dev/cli`](https://www.npmjs.com/package/@pacifica-dev/cli) `v0.1.5` |
| **Agent Skill** | [pacifica-mcp.xyz/skill.md](https://pacifica-mcp.xyz/skill.md) · [ClawHub](https://clawhub.ai) `pacifica@1.0.0` |
| **Testnet** | [test-app.pacifica.fi](https://test-app.pacifica.fi) (access code: `Pacifica`) |

---

## Install in one line

**MCP server** (Claude Code, Cursor, Windsurf, OpenClaw, Gemini CLI, and 12+ hosts):

```bash
claude mcp add pacifica npx @pacifica-dev/mcp
```

**Standalone CLI** (terminal-native, no AI required):

```bash
npm install -g @pacifica-dev/cli
pacifica prices --symbol BTC
pacifica market-order --symbol SOL --side bid --amount 0.5
```

**Agent Skill** (teaches AI agents when and how to use each tool):

```bash
pnpm dlx skills add github:Blockchain-Oracle/pacifica-mcp --skill pacifica
```

---

## What does it do?

Pacifica MCP connects AI agents to Pacifica — the biggest perpetuals DEX on Solana. It works as an MCP server (for Claude, Cursor, OpenClaw, and 12+ AI hosts), a CLI for your terminal, and an Agent Skill that teaches any AI when and how to trade.

Right now, if you want an AI to trade on Pacifica, you're on your own — writing API calls, handling Ed25519 signing, managing WebSocket connections, parsing raw data. There's nothing connecting AI agents to Pacifica.

That's what we built. 36 tools covering everything: market data, trading, account management, subaccounts, real-time streaming. You tell the agent what you want in plain English — it checks prices, sets leverage, places orders, sets stop losses, monitors your portfolio, and closes trades. All by itself.

---

## Key features

- **36 tools** covering the entire Pacifica REST + WebSocket API
- **12+ AI hosts**: Claude Code, Cursor, Windsurf, VS Code Copilot, OpenClaw, Gemini CLI, Codex, Zed, Continue, Cline, Goose, and more
- **Three interfaces**: MCP server, standalone CLI, and Agent Skill
- **One-command install**: `claude mcp add pacifica npx @pacifica-dev/mcp`
- **Full trading**: market orders, limit orders, stop orders, batch orders, edit/cancel
- **Risk management**: take-profit, stop-loss, leverage (1-100x), cross/isolated margin
- **Real-time WebSocket streaming**: live prices, trades, orderbook, and account updates across 75+ markets
- **Subaccount management**: create, list, transfer funds between accounts
- **Response normalization**: human/AI-readable keys (not raw API abbreviations)
- **Smart caching** with auto-invalidation after write operations
- **CLI persistent WebSocket** via background daemon
- **Agent Skill** with tool selection decision tree, parameter guide, and example workflows
- **Published on ClawHub** for OpenClaw discovery
- **Full documentation** with search (pagefind) and LLM-friendly `llms.txt`
- **75+ markets**: crypto perps, equities (NVDA, TSLA, GOOGL), forex (EURUSD, USDJPY), commodities (XAU, XAG, oil)

---

## How does it use Pacifica?

Pacifica isn't a feature we bolted on — it's the entire foundation. Every single tool wraps a Pacifica API endpoint.

| Integration | Details |
| :--- | :--- |
| **Market data** | Real-time prices, orderbooks, OHLCV candles, funding rates, recent trades from `test-api.pacifica.fi` and `api.pacifica.fi` |
| **Trading** | Market/limit/stop/batch orders, TP/SL, leverage, margin — all Ed25519-signed per Pacifica's Python SDK protocol |
| **WebSocket** | Live streaming via `wss://test-ws.pacifica.fi/ws` — prices, trades, orderbook, account updates |
| **Subaccounts** | Dual-signature creation protocol, fund transfers between main and sub accounts |
| **Response handling** | Unwraps `{success, data, error}` envelope, normalizes abbreviated keys, preserves decimal string precision |

---

## What makes this unique?

There's no existing MCP server or agentic tooling for Pacifica — we're the first. Before this, building an AI trading agent on Pacifica meant weeks of raw API integration work.

Most hackathon submissions build a single bot. We built the infrastructure that lets anyone build any bot. A developer can create a funding rate arbitrage bot, a grid trader, a portfolio rebalancer, or something we haven't imagined — all using the same 36 tools through natural language.

The Agent Skill is the other differentiator. It teaches AI agents when to use each tool, how to handle edge cases, and chains multi-step workflows autonomously. The agent doesn't just execute commands — it reasons about what to do.

And it's not locked to one platform. Same tools work across Claude, Cursor, OpenClaw (WhatsApp, Telegram, Slack), Gemini, VS Code, and 12+ hosts. One install, every AI agent becomes a Pacifica trader.

---

## Who is this for?

**Developers and bot builders** who want to build trading bots, monitoring dashboards, or automated strategies on Pacifica without spending days on raw API integrations.

**Traders who already use AI tools.** If you're in Claude Code or Cursor all day, now you can manage positions through conversation — no more switching between terminal and exchange.

**The Pacifica ecosystem.** Every AI agent that installs this MCP becomes a potential Pacifica user. We're distribution infrastructure — the more AI agents exist, the more traders Pacifica gets.

---

## Why would users adopt this in production?

Because it removes the hardest part of building on Pacifica — the integration layer. Without us, a developer needs to learn the API, implement Ed25519 signing, handle response envelopes, manage WebSocket connections, deal with decimal string precision, and understand subaccount protocols. That's weeks before writing a single line of trading logic.

With us, it's one command. Published on npm with semantic versioning. Full documentation with search. Works on testnet and mainnet. Open source. All 36 tools tested end-to-end with real trades on testnet.

The real answer is simpler: there's no alternative. If you want AI agents to trade on Pacifica, this is the only tool that exists. And it works.

---

## What's next?

- **Strategy templates** — pre-built skills for grid trading, funding rate arbitrage, DCA, mean reversion
- **Multi-agent orchestration** — separate agents for monitoring, execution, and risk management
- **Builder code integration** — earn fees on every AI-routed trade
- **Mainnet safety guardrails** — spending limits, position caps, confirmation requirements
- **On-chain deposit via CLI** — Solana SPL token transfers without leaving the terminal

---

## Vision

Turn every AI agent into a Pacifica trader. The future of trading isn't dashboards and terminals — it's conversation. You tell an AI what you want, and it handles the rest. Pacifica MCP is the infrastructure that makes that possible. Today it's 36 tools on one DEX. Tomorrow it's the standard for how AI agents interact with decentralized finance.

---

## Tech stack

| Layer | Choice |
| :--- | :--- |
| **Platform** | Pacifica Finance (Solana) |
| **Signing** | Ed25519 via tweetnacl — matched Pacifica Python SDK protocol |
| **MCP** | @modelcontextprotocol/sdk — stdio transport |
| **CLI** | Commander.js + same core library |
| **WebSocket** | ws — persistent connections with heartbeat and auto-reconnect |
| **Caching** | In-memory with 5-min TTL + auto-invalidation on writes |
| **Documentation** | Nextra 4 + pagefind search + llms.txt |
| **Landing page** | Next.js 16 + Tailwind + shadcn/ui |
| **Publishing** | npm (`@pacifica-dev/mcp`, `@pacifica-dev/cli`) + ClawHub (`pacifica@1.0.0`) |

---

## Built for

**Pacifica Hackathon — Trading Applications & Bots Track**

We built the infrastructure layer that gives AI agents native access to every Pacifica API endpoint. 36 tools. Market data, order execution, account management, subaccounts, real-time streaming. MCP server, CLI, and Agent Skill. Published on npm, documented, tested, and open source.

We didn't build a bot. We built the tools that let you build any bot.
