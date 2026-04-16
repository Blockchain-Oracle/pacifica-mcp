# Changelog

## @pacifica-dev/cli@0.1.4 / @pacifica-dev/mcp@0.1.6

### Features
- **Response normalization**: Orderbook and candle responses now use human-readable keys (`symbol`, `bids`, `asks`, `price`, `amount`, `open`, `close`, `high`, `low`, `volume`) instead of raw API abbreviations (`s`, `l`, `p`, `a`, `o`, `c`, `h`, `v`)
- **CLI persistent WebSocket**: `watch-start`, `watch-read`, `watch-stop` now work in CLI via a background daemon process with file-based IPC. Previously only worked in MCP mode.
- **`watch-read` controls**: Added `--summary-only` and `--max-events` parameters to prevent data flooding on high-volume channels like `prices`
- **Cache invalidation**: Write operations (orders, leverage, margin mode, etc.) now clear the read cache so subsequent queries return fresh data
- **LLM-friendly docs**: Added `llms.txt` and `llms-full.txt` at docs root for AI consumption
- **Pagefind search**: Docs site now has full-text search via pagefind indexing
- **Complete tool reference**: All 36 tools now have dedicated documentation pages

### Bug Fixes
- **`workspace:*` dependency**: Fixed `@pacifica-dev/mcp` publishing with unresolved `workspace:*` reference to `@pacifica-dev/cli`
- **`order_id` type coercion**: Fixed cancel, cancel-stop, edit-order, and batch-order sending `order_id` as string instead of number (caused API deserialization errors)
- **Create-subaccount signing**: Fixed dual-signature protocol to match Pacifica Python SDK — subaccount signs main's pubkey (`subaccount_initiate`), main signs sub's signature (`subaccount_confirm`), shared timestamp
- **Transfer-funds signing type**: Changed from `subaccount_transfer` to `transfer_funds` to match API
- **Symbol format**: Changed all examples and descriptions from `BTC-PERP` to `BTC` — Pacifica symbols have no suffix
- **set-tpsl description**: Changed "Position side" to "Exit side" — the `side` parameter is the exit side, not the position side
- **Stop-order CLI flag**: Fixed `--reduce-only` boolean default — now uses `--no-reduce-only` negation pattern
- **set-margin-mode CLI flag**: Changed `--isolated <bool>` string to proper `--isolated / --no-isolated` boolean flags
- **Testnet URLs**: Fixed `test.pacifica.fi` to `test-app.pacifica.fi` across all docs and code

### Documentation
- **Deposit guide**: Added step-by-step deposit flow (export private key → import into Phantom/Backpack → connect on Pacifica web app)
- **Withdrawal clarity**: Documented that withdrawals and subaccount transfers are USDC only
- **Spot markets**: Documented SOL-USDC, BTC-USDC, ETH-USDC spot symbols and conversion flow
- **SKILL.md overhaul**: Table-based tool selection, CLI section, WebSocket guidance, critical behaviors (exit side for TP/SL, null responses, deposit flow)
- **First-run banner**: Improved with actionable 4-step deposit instructions
- **Tool count**: Fixed from 32 to 36 across all references
- **Asset language**: Deposit language is asset-agnostic (SOL, USDC, etc.); withdraw/transfer correctly says USDC

## @pacifica-dev/cli@0.1.3 / @pacifica-dev/mcp@0.1.5

- Initial fixes for response normalization and USDC language

## @pacifica-dev/cli@0.1.2 / @pacifica-dev/mcp@0.1.4

- Fixed `workspace:*` dependency in MCP package
- Initial release with 36 tools
