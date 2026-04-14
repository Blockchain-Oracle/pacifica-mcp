# Pacifica MCP Server

MCP server giving AI agents the ability to trade, monitor, and manage positions on Pacifica — the #1 Solana perps DEX.

## Architecture

- `packages/cli` — Core library: 32 tools, API client, signing, wallet, cache
- `packages/mcp` — Thin MCP server wrapper (stdio transport, imports from cli)
- `packages/skills/pacifica` — Agent Skill (SKILL.md for cross-client install)
- `packages/web` — Next.js landing page + tool explorer
- `packages/docs` — Nextra documentation

## Development

```bash
pnpm install
pnpm dev:mcp    # MCP server (tsx watch)
pnpm dev:web    # Web on :3002
pnpm dev:docs   # Docs on :3001
```

## Rules

- Use `pino` logger — never `console.log`
- Use `pnpm add` to install packages — never hardcode versions
- Testnet by default (`PACIFICA_NETWORK=testnet`)
- All Pacifica API responses are wrapped: `{success, data, error, code}` — always unwrap
- All numeric values from Pacifica are decimal strings — preserve as strings in output
- Ed25519 signing for write operations — see `packages/cli/src/lib/signing.ts`
- Tool pattern: `registerXxxTool(server)` with zod schemas
- Response pattern: `ok(data)` or `err(message)`
- Cache read-only tools with `withCache()` (5-min TTL)

## Pacifica API

- Testnet: `https://test-api.pacifica.fi/api/v1`
- Mainnet: `https://api.pacifica.fi/api/v1`
- Docs: https://pacifica.gitbook.io/docs/api-documentation/api
