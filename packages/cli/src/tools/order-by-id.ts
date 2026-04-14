import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { withCache } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { OrderHistoryById } from "../lib/types.js";

export function registerOrderByIdTool(server: McpServer): void {
  server.registerTool(
    "pacifica-order-by-id",
    {
      title: "Order History By ID",
      description:
        "Get the full event history for a specific order by its order_id.\n\nReturns all state changes (created, filled, cancelled, etc.) for the order.\n\nFree — no auth required.",
      inputSchema: z.object({
        order_id: z
          .number()
          .int()
          .describe("The order ID to look up"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-order-by-id invoked");
      return withCache("pacifica-order-by-id", params, async () => {
        try {
          const data = await get<OrderHistoryById[]>(
            "/orders/history_by_id",
            { order_id: String(params.order_id) },
          );
          return ok(data);
        } catch (e) {
          logger.error({ err: e }, "pacifica-order-by-id error");
          return err(String(e));
        }
      });
    },
  );
}
