import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { wsManager } from "../lib/ws.js";

export function registerWatchStopTool(server: McpServer): void {
  server.registerTool(
    "pacifica-watch-stop",
    {
      title: "Watch Stop",
      description:
        "Stop a WebSocket subscription (or all subscriptions if no ID is given).\n\nReturns the list of stopped subscription IDs and any remaining active ones.",
      inputSchema: z.object({
        subscription_id: z
          .string()
          .optional()
          .describe("Subscription ID to stop. Omit to stop ALL subscriptions."),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-watch-stop invoked");
      try {
        const stopped: string[] = [];

        if (params.subscription_id) {
          // Stop a single subscription
          const ok_ = wsManager.unsubscribe(params.subscription_id);
          if (!ok_) {
            const active = wsManager.listSubscriptions();
            return err(
              `Subscription "${params.subscription_id}" not found` +
                (active.length > 0
                  ? `. Active subscriptions: ${JSON.stringify(active)}`
                  : ". No active subscriptions."),
            );
          }
          stopped.push(params.subscription_id);
        } else {
          // Stop all
          const active = wsManager.listSubscriptions();
          for (const sub of active) {
            wsManager.unsubscribe(sub.id);
            stopped.push(sub.id);
          }
          if (stopped.length === 0) {
            return ok({ message: "No active subscriptions to stop." });
          }
        }

        const remaining = wsManager.listSubscriptions();
        return ok({
          stopped,
          remaining_subscriptions: remaining,
        });
      } catch (e) {
        logger.error({ err: e }, "pacifica-watch-stop error");
        return err(String(e));
      }
    },
  );
}
