# Pacifica MCP — Demo Script

> **Max length:** 10 minutes. Voice narration + screen recording. Camera on.

---

## Opening (60 seconds)

*[Camera on you, screen behind]*

> "The Pacifica team asked for trading bots, monitoring dashboards, automated strategies. We didn't build any of those. We built something bigger.
>
> We built the infrastructure layer that lets ANY AI agent trade on Pacifica. 36 tools covering every API endpoint — market data, order execution, account management, real-time streaming.
>
> Instead of building one bot, we built the tools that let you build any bot — through natural language.
>
> This is Pacifica MCP. It works in Claude Code, Cursor, Windsurf, VS Code Copilot, Gemini CLI — any MCP host. It also ships as a standalone CLI and an Agent Skill.
>
> We don't fully know the limitations of what we've built yet. And I think that's the point — we built the foundation, and developers will take it places we haven't imagined.
>
> Let me show you."

---

## Install (30 seconds)

*[Switch to Claude Code terminal]*

> "One command. That's it."

```bash
claude mcp add pacifica npx @pacifica-dev/mcp
```

> "The MCP server auto-generates a wallet on first use. To deposit on testnet, you import the private key into Phantom, go to test-app.pacifica.fi, and fund your account. I've already done that — let's get into it."

---

## Demo Block 1: The Agent Explores the Market (60 seconds)

**Prompt 1:**
```
What markets does Pacifica offer? How many are there? And what's the current BTC and SOL price?
```
*[Let the agent call pacifica-markets and pacifica-prices on its own]*

> "No instructions on which tool to call. The agent reads the skill, picks the right tools, chains them together."

**Prompt 2:**
```
I'm interested in SOL. Show me the orderbook, the last 6 hours of 1-hour candles, and the current funding rate.
```
*[Agent calls orderbook + candles + funding-rates — all in one shot]*

> "Three tools, one prompt. Notice the orderbook shows proper bids and asks with price, amount, num_orders — not cryptic API abbreviations. We normalize everything so the agent can reason about it."

---

## Demo Block 2: Fully Autonomous Trading (90 seconds)

> "Now let's trade. I'm going to give the agent a goal and let it figure out the steps."

**Prompt 3:**
```
I want to go long on SOL with 5x leverage. Open a position worth about $50, and set a take profit 5% above entry and a stop loss 5% below. Show me the position when you're done.
```
*[Agent will: set leverage → calculate amount → place market order → get entry price → calculate TP/SL prices → set TP/SL → show positions. All autonomous.]*

> "I didn't tell it which tools to use. I didn't tell it the entry price for the TP/SL math. The agent checked the price, did the calculation, placed the order, set the risk management, and confirmed the position. Fully autonomous, end to end."

**Prompt 4:**
```
Also open a small ETH short — 0.005 ETH at market. Set a stop loss at $2,500.
```
*[Agent opens second position, sets SL]*

> "Two positions now, two different directions. The agent handles the exit-side convention automatically — it knows a short exits with a bid."

---

## Demo Block 3: Real-Time Monitoring (45 seconds)

**Prompt 5:**
```
Start monitoring live prices. After 5 seconds, give me a summary of what moved the most.
```
*[Agent calls watch-start → waits → watch-read with summary_only → watch-stop]*

> "WebSocket streaming. The agent subscribed to all 75 markets, buffered the price updates, and summarized them — without flooding the context with raw data. That's the summary_only mode we built specifically for AI agents."

---

## Demo Block 4: Portfolio & History (45 seconds)

**Prompt 6:**
```
Give me a full portfolio review — my account balance, all positions with unrealized PnL, and my trade history from today.
```
*[Agent calls account + positions + trade-history]*

> "Complete picture in one prompt. Balance, margin, positions, realized PnL from every trade today."

---

## Demo Block 5: Close Everything (30 seconds)

**Prompt 7:**
```
Close all my positions and cancel all open orders. Show me the final account balance.
```
*[Agent cancels orders, closes positions, shows final balance]*

> "Clean exit. The agent handled the TP/SL cancellation and position closing in the right order."

---

## Demo Block 6: CLI Power (45 seconds)

*[Switch to plain terminal]*

> "Same 36 tools, also available as a CLI. No AI needed — just terminal commands."

```bash
pacifica prices --symbol BTC
pacifica orderbook --symbol ETH --agg-level 100
pacifica account
pacifica watch-start --channel prices
pacifica watch-read --subscription-id prices_cli --summary-only
pacifica watch-stop
```

> "JSON output. Pipe to jq, build scripts, integrate into your own tools. The CLI and MCP share the same codebase — same signing, same wallet, same everything."

---

## Demo Block 7: Subaccounts (30 seconds)

> "We also built subaccount management — create isolated trading accounts, transfer funds between them."

```bash
pacifica create-subaccount
pacifica list-subaccounts
pacifica transfer-funds --to <address> --amount 10
```

> "Subaccounts use dual Ed25519 signatures — the main account and subaccount both sign. We matched Pacifica's Python SDK signing protocol exactly."

---

## Closing (60 seconds)

*[Show pacifica-mcp.xyz, docs.pacifica-mcp.xyz, npm pages]*

> "Everything is live right now.
>
> pacifica-mcp.xyz — the landing page with tool explorer.
> docs.pacifica-mcp.xyz — full documentation for all 36 tools with guides, examples, and an LLM-friendly llms.txt.
> Published on npm — @pacifica-dev/mcp and @pacifica-dev/cli.
> Open source on GitHub.
>
> We also ship an Agent Skill that works across Claude Code, Cursor, Windsurf, VS Code Copilot, Gemini CLI, and more. The skill teaches any AI agent when and how to use every tool.
>
> What's next? Strategy templates for grid trading and funding rate arbitrage. Multi-agent orchestration. Builder code integration so developers earn fees on AI-routed trades. And mainnet deployment with safety guardrails.
>
> We built the infrastructure layer that turns every AI agent into a Pacifica trader. The bots developers will build with this — we haven't even imagined them yet.
>
> Thank you."

---

## Key Demo Moments for Judges

| Moment | What it proves |
|---|---|
| Prompt 3 (autonomous trade) | The agent chains 5+ tools without hand-holding |
| Prompt 5 (WebSocket summary) | Real-time streaming designed for AI consumption |
| Prompt 7 (clean exit) | Full lifecycle: open → manage → close, all autonomous |
| CLI section | Same tools work outside AI — developer infrastructure |
| Subaccounts | Deep Pacifica API integration, not surface-level |

---

## Live Links to Show

- **Landing page:** https://pacifica-mcp.xyz
- **Documentation:** https://docs.pacifica-mcp.xyz
- **npm (MCP):** https://www.npmjs.com/package/@pacifica-dev/mcp
- **npm (CLI):** https://www.npmjs.com/package/@pacifica-dev/cli
- **GitHub:** https://github.com/Blockchain-Oracle/pacifica-mcp
- **Testnet:** https://test-app.pacifica.fi (access code: `Pacifica`)

---

## Recording Checklist

```
[ ] Voice narration — clear, not rushed
[ ] Camera on — show yourself
[ ] Screen recording — Claude Code + terminal
[ ] Install demo — claude mcp add pacifica npx @pacifica-dev/mcp
[ ] Live market data — prices, orderbook, candles
[ ] Live autonomous trade — agent chains leverage + order + TP/SL
[ ] Live WebSocket — watch prices, summary mode
[ ] Portfolio review — account + positions + history
[ ] Clean exit — cancel + close all
[ ] CLI demo — prices, orderbook, account, watch
[ ] Subaccount demo — create, list, transfer
[ ] Show live links — website, docs, npm, GitHub
[ ] Under 10 minutes total
```
