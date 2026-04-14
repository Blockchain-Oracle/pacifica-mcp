#!/usr/bin/env node
/**
 * @pacifica/mcp — Pacifica MCP stdio server entry point.
 *
 * This package is a THIN wrapper: all tool implementations live in
 * `@pacifica/cli` (the standalone CLI package), which exports a
 * `createMcpServer()` factory. Here we import that factory, wire it
 * up to a `StdioServerTransport`, and connect.
 *
 * Why two packages instead of one with two bins: npx can't decide
 * which bin to run when a package has multiple bins and none matches
 * the package tail name. So shipping a dedicated single-bin package
 * (`@pacifica/mcp` → `pacifica-mcp`) is the only clean way to make
 *   `claude mcp add pacifica npx @pacifica/mcp`
 * just work for every MCP host that spawns via npx.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "@pacifica/cli";

async function main(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `[pacifica-mcp] fatal: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
  );
  process.exit(1);
});
