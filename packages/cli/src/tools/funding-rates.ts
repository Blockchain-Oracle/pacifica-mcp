import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { FundingRateHistory, Paginated } from "../lib/types.js";

export function registerFundingRatesTool(server: McpServer): void {
  server.registerTool(
    "pacifica-funding-rates",
    {
      title: "Funding Rate History",
      description:
        "Get historical funding rates for a Pacifica market.\n\nFree — no auth required.",
      inputSchema: z.object({
        symbol: z.string().describe("Market symbol (e.g. BTC)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .default(20)
          .describe("Number of funding rate entries (default 20)"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-funding-rates invoked");
      return withCache("pacifica-funding-rates", params, async () => {
        try {
          const data = await get<Paginated<FundingRateHistory>>("/funding_rate/history", {
            symbol: params.symbol,
            limit: String(params.limit),
          });
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-funding-rates error");
          return err(String(e));
        }
      });
    },
  );
}
