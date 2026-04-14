# Pacifica Hackathon — Video Submission Guide

> **Max length:** 10 minutes. Shorter is better, clarity matters most.
> **Format:** Voice narration required. Screen recording recommended. Camera optional.

---

## Video Script for Pacifica MCP

### 1. Problem & Idea (30-45 seconds)

**Script:**

> "AI agents are transforming how developers interact with tools — but when it comes to crypto trading, there's a gap. If you want Claude, Cursor, or any AI agent to trade perpetuals on Pacifica, there's no bridge. You'd have to manually copy data, construct API calls, handle Ed25519 signing — all by hand.
>
> We built **Pacifica MCP** — an MCP server that gives AI agents native access to every Pacifica API endpoint. Market data, account monitoring, order execution, real-time WebSocket streaming — all through natural language."

**Who it's for:** Developers, quant traders, AI agent builders, anyone who wants to automate trading on Pacifica through AI.

---

### 2. Solution Overview (30-45 seconds)

**Script:**

> "Pacifica MCP is a Model Context Protocol server with 36 tools covering the entire Pacifica REST and WebSocket API. It ships as three interfaces:
>
> 1. **MCP server** — one-line install for Claude, Cursor, Windsurf, and 9+ other AI hosts
> 2. **Standalone CLI** — `pacifica prices --symbol BTC` from any terminal
> 3. **Agent Skill** — teaches AI agents when and how to use each tool
>
> It's published on npm, has full documentation, and works on testnet and mainnet."

**Show:** The landing page briefly, npm package pages.

---

### 3. Live Product Walkthrough (1.5-3 minutes)

**This is the most important section. Show it working.**

**Demo sequence:**

```
Step 1: Install (10 seconds)
$ claude mcp add pacifica npx @pacifica-dev/mcp
→ Show it configuring in Claude Code

Step 2: Market Data (30 seconds)
"What's the BTC price on Pacifica?"
→ Agent calls pacifica-prices, returns live price data

"Show me the ETH orderbook"
→ Agent calls pacifica-orderbook, returns bids/asks

"What are the top funding rates?"
→ Agent calls pacifica-funding-rates

Step 3: Account Monitoring (30 seconds)
"What's my account balance?"
→ Agent calls pacifica-account, shows equity/margin/positions

"Show my open positions"
→ Agent calls pacifica-positions, shows live positions

Step 4: Trading (45 seconds)
"Open a 0.01 ETH long at market"
→ Agent calls pacifica-market-order, signs with Ed25519, returns order_id

"Set a stop loss at $2,100 on my ETH position"
→ Agent calls pacifica-set-tpsl

"What are my positions now?"
→ Shows updated position with TP/SL set

Step 5: Real-Time WebSocket (30 seconds)
"Watch BTC prices for 10 seconds"
→ Agent calls pacifica-watch, streams live data, returns summary

Step 6: CLI Demo (20 seconds)
$ pacifica prices --symbol SOL
$ pacifica positions
$ pacifica wallet
→ Show same tools work from terminal
```

---

### 4. Pacifica Integration (30-60 seconds)

**Script:**

> "Pacifica is core to everything — not optional. Here's exactly how we integrate:
>
> - **36 tools** wrapping every Pacifica REST API endpoint — markets, account, orders, subaccounts
> - **Ed25519 signing** for all write operations — market orders, limit orders, TP/SL, leverage changes
> - **WebSocket streaming** — real-time price feeds, trade streams, position updates via `wss://ws.pacifica.fi/ws`
> - **Subaccount management** — create, list, transfer funds between accounts
> - All responses properly unwrap Pacifica's `{success, data, error}` envelope
> - All numeric values handled as decimal strings per Pacifica's API spec
> - Testnet/mainnet toggle via a single environment variable"

**Show:** The API client code briefly, the signing module, a live testnet API response.

---

### 5. Value & Impact (20-40 seconds)

**Script:**

> "Why would someone use this?
>
> - **For developers:** Build trading bots, monitoring dashboards, or automated strategies — all through AI agents instead of writing raw API code
> - **For traders:** Ask Claude to manage your positions in natural language. No more switching between terminal and exchange.
> - **For the Pacifica ecosystem:** Every AI agent that installs this MCP becomes a potential Pacifica user. It's distribution through developer tools.
>
> There's nothing else like this for Pacifica. We're the first MCP server covering the full API."

---

### 6. What's Next (20-30 seconds)

**Script:**

> "With more time, we'd add:
> - **Builder code integration** — earn fees on every AI-routed trade
> - **Strategy templates** — pre-built agent skills for grid trading, funding rate arbitrage, DCA
> - **Multi-agent orchestration** — multiple AI agents coordinating trades on different markets
> - **Mainnet deployment** with safety guardrails and spending limits
>
> Pacifica MCP turns every AI agent into a Pacifica trader. Thank you."

---

## Recording Checklist

```
[ ] Voice narration — clear, not rushed
[ ] Screen recording — show Claude Code / terminal
[ ] Install demo — claude mcp add pacifica npx @pacifica-dev/mcp
[ ] Live market data query — prices, orderbook
[ ] Live account query — balance, positions
[ ] Live trade execution — market order on testnet
[ ] Live WebSocket — pacifica-watch
[ ] CLI demo — pacifica prices, pacifica positions
[ ] Show Pacifica API integration explicitly
[ ] Explain value proposition
[ ] Under 10 minutes total
[ ] Upload to YouTube/Loom (unlisted is fine)
```

## Submission Form Fields

- **Project name:** Pacifica MCP
- **Track:** Trading Applications & Bots
- **Team:** [your name]
- **GitHub:** https://github.com/Blockchain-Oracle/pacifica-mcp
- **npm:** https://www.npmjs.com/package/@pacifica-dev/mcp
- **Demo video:** [YouTube/Loom URL]
- **Description:** MCP server giving AI agents the ability to trade, monitor, and manage positions on Pacifica. 36 tools covering the full Pacifica REST + WebSocket API — market data, account management, order execution, subaccounts, and real-time streaming. Ships as MCP server, standalone CLI, and Agent Skill. Published on npm as @pacifica-dev/mcp.
- **How it uses Pacifica:** Wraps the entire Pacifica API (36 endpoints) as MCP tools. Enables AI agents to read market data, place orders (market/limit/stop), manage positions (TP/SL, leverage, margin), handle subaccounts, and stream real-time data via WebSocket — all through natural language. Uses Ed25519 signing for authenticated operations. Works on testnet and mainnet.
