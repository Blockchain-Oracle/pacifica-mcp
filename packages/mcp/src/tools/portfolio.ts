import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { logger } from "../lib/logger.js";

export function registerPortfolioTool(server: McpServer): void {
  server.registerTool(
    "pacifica-portfolio",
    {
      title: "Portfolio Equity History",
      description:
        "Get portfolio equity history over time.\n\nIf no account address is provided, uses the local MCP wallet.\n\nFree — no auth required.",
      inputSchema: z.object({
        account: z
          .string()
          .optional()
          .describe(
            "Solana wallet address to query. Defaults to MCP wallet.",
          ),
        time_range: z
          .enum(["1d", "7d", "14d", "30d", "all"])
          .default("7d")
          .describe("Time range for equity history (default 7d)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-portfolio invoked");
      const address = params.account ?? loadOrCreateWallet().publicKey;
      const cacheParams = { account: address, time_range: params.time_range };
      return withCache("pacifica-portfolio", cacheParams, async () => {
        try {
          const data = await get("/portfolio", {
            account: address,
            time_range: params.time_range,
          });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-portfolio error");
          return err(String(e));
        }
      });
    },
  );
}
