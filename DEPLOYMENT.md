# Deployment Guide (Internal — Do Not Commit)

Everything you need to ship the Pacifica MCP project: npm publishing, domain setup, web/docs deployment, and production config.

---

## 1. Publish `@pacifica/mcp` to npm

This is what makes `claude mcp add pacifica npx @pacifica/mcp` work for anyone.

### Prerequisites
- npm account (https://www.npmjs.com/signup)
- npm org `@pacifica` created (https://www.npmjs.com/org/create — free for public packages)

### Steps

```bash
# 1. Login to npm
npm login

# 2. Create the @pacifica org (one-time)
# Go to https://www.npmjs.com/org/create → name: "pacifica" → free/public

# 3. Build the package
cd packages/mcp
pnpm build

# 4. Verify what gets published
npm pack --dry-run
# Should show: dist/, package.json — no src/ or node_modules/

# 5. Add .npmignore if needed
# Create packages/mcp/.npmignore:
#   src/
#   tsconfig.json
#   node_modules/
#   *.ts
#   !dist/**

# 6. Publish
npm publish --access public

# 7. Verify
npx @pacifica/mcp --help
# Should show the CLI help
```

### Updating
```bash
# Bump version
npm version patch  # or minor/major
pnpm build
npm publish
```

### package.json Checklist
Make sure `packages/mcp/package.json` has:
```json
{
  "name": "@pacifica/mcp",
  "version": "0.1.0",
  "type": "module",
  "bin": { "pacifica-cli": "./dist/cli.js" },
  "main": "./dist/index.js",
  "files": ["dist"],         ← ADD THIS — controls what npm publishes
  "repository": {             ← ADD THIS
    "type": "git",
    "url": "https://github.com/YOUR_ORG/pacifica-mcp"
  },
  "keywords": ["pacifica", "mcp", "solana", "perps", "trading", "ai"],
  "license": "MIT"
}
```

---

## 2. GitHub Repository

### Create Repo
```bash
# 1. Create on GitHub: github.com/new → "pacifica-mcp" (public)
# 2. Push
cd /Users/apple/dev/hackathon/Pacifica/pacifica-mcp
git remote add origin https://github.com/YOUR_ORG/pacifica-mcp.git
git branch -M main
git push -u origin main
```

### Add .npmignore Before Publishing
```bash
# packages/mcp/.npmignore
cat > packages/mcp/.npmignore << 'EOF'
src/
tsconfig.json
*.ts
!dist/**
EOF
```

---

## 3. Deploy Web (Landing Page)

### Option A: Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd packages/web
vercel

# Follow prompts:
# - Link to existing project? No → Create new
# - Project name: pacifica-mcp-web
# - Framework: Next.js (auto-detected)
# - Root directory: packages/web
# - Build command: (default)
# - Output directory: (default)

# 3. Set custom domain (after first deploy)
vercel domains add pacifica-mcp.xyz  # or whatever domain
```

### Option B: Cloudflare Pages
```bash
# 1. Connect GitHub repo to Cloudflare Pages
# 2. Set:
#    - Build command: cd packages/web && pnpm build
#    - Output directory: packages/web/.next
#    - Root directory: /
```

### Environment Variables for Web
None needed — the web is a static landing page with no backend.

---

## 4. Deploy Docs

### Option A: Vercel (Separate Project)
```bash
cd packages/docs
vercel
# Project name: pacifica-mcp-docs
# Framework: Next.js
```

### Option B: Same Domain, Different Path
Use Vercel rewrites to serve docs at `pacifica-mcp.xyz/docs`:
```json
// packages/web/vercel.json
{
  "rewrites": [
    { "source": "/docs/:path*", "destination": "https://pacifica-mcp-docs.vercel.app/:path*" }
  ]
}
```

### Subdomain Approach
- Web: `pacifica-mcp.xyz` (or `pacifica.tools`)
- Docs: `docs.pacifica-mcp.xyz`

---

## 5. Domain Options

Suggested domains (check availability):
- `pacifica-mcp.xyz`
- `pacifica.tools`
- `pacifica-cli.com`
- `pacificamcp.dev`

### Where to Buy
- Namecheap, Cloudflare Registrar, or Google Domains
- After buying, point DNS to Vercel:
  ```
  A     @      76.76.21.21
  CNAME www    cname.vercel-dns.com
  ```

---

## 6. Production Environment

### MCP Package (npm)
No env vars needed for the published npm package. Users configure their own:
- `PACIFICA_NETWORK` — `testnet` or `mainnet` (default: testnet)
- `PACIFICA_PRIVATE_KEY` — optional, overrides auto-generated wallet
- `LOG_LEVEL` — `debug`, `info`, `warn`, `error` (default: info)

### Switching to Mainnet
When ready for mainnet, users just set:
```bash
PACIFICA_NETWORK=mainnet pacifica-cli prices --symbol BTC
```

Or in Claude Code:
```bash
claude mcp add pacifica -e PACIFICA_NETWORK=mainnet npx @pacifica/mcp
```

---

## 7. Hackathon Submission

### What to Submit
1. **GitHub repo URL** — public repo with README, code, docs
2. **npm package URL** — `https://www.npmjs.com/package/@pacifica/mcp`
3. **Web URL** — deployed landing page
4. **Docs URL** — deployed documentation
5. **Demo video** — screen recording of:
   - Installing with `claude mcp add pacifica npx @pacifica/mcp`
   - Asking Claude "What's the BTC price on Pacifica?"
   - Placing a trade: "Open a 0.001 BTC long"
   - Checking positions: "Show my positions"
   - Using CLI: `pacifica-cli prices --symbol ETH`

### Demo Script (for Video)
```
1. "Let me show you Pacifica MCP — AI-powered trading on Pacifica DEX"

2. Install (5 seconds):
   $ claude mcp add pacifica npx @pacifica/mcp
   ✓ server configured

3. Chat with Claude (30 seconds):
   "What are the top 5 markets by volume on Pacifica?"
   → Shows 5 markets with volume, price, funding rate

   "What's my account balance?"
   → Shows equity, margin, positions count

   "Open a 0.001 BTC long at market with 1% slippage"
   → Places order, returns order_id

   "What are my open positions now?"
   → Shows BTC long position with entry price

   "Set a stop loss at $68,000 on my BTC position"
   → Sets TP/SL

4. CLI demo (15 seconds):
   $ pacifica-cli prices --symbol SOL
   $ pacifica-cli positions
   $ pacifica-cli orderbook --symbol BTC

5. "32 tools covering every Pacifica API endpoint.
    Market data, account monitoring, order management,
    subaccount management — all typed, all tested."
```

### Submission Form Fields
Based on Pacifica hackathon requirements:
- **Project name:** Pacifica MCP
- **Track:** Trading Applications & Bots
- **Team members:** [your name]
- **GitHub:** https://github.com/YOUR_ORG/pacifica-mcp
- **Demo video:** [upload to YouTube/Loom]
- **Description:** MCP server giving AI agents the ability to trade, monitor, and manage positions on Pacifica. 32 tools covering the full Pacifica API — market data, account management, order execution, and subaccount management. Includes CLI, web landing page, and documentation.
- **How it uses Pacifica:** Wraps the entire Pacifica REST API (all 32+ endpoints) as MCP tools. Enables AI agents (Claude, GPT, etc.) to read market data, place orders, manage positions, set TP/SL, handle subaccounts — all through natural language. Uses Ed25519 signing for authenticated operations.

---

## 8. Pre-Submission Checklist

```
[ ] npm package published and installable: npx @pacifica/mcp --help
[ ] GitHub repo is public with README
[ ] Web landing page deployed with custom domain
[ ] Docs site deployed
[ ] Demo video recorded and uploaded
[ ] Submission form filled
[ ] All 32 tools tested against testnet
[ ] Build passes (tsc, next build for web/docs)
[ ] README has clear install instructions
[ ] CLAUDE.md is up to date
```

---

## 9. Post-Hackathon Roadmap (Optional — for pitch)

- WebSocket support (real-time price/position streams)
- Builder code integration (earn fees on every AI-routed trade)
- Multi-agent strategies (grid bot, funding rate arb via MCP)
- Mainnet deployment with safety guardrails
- npm downloads analytics dashboard
