import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { wsManager } from "../lib/ws.js";
import { summarizeEvents } from "./watch.js";

export function registerWatchReadTool(server: McpServer): void {
  server.registerTool(
    "pacifica-watch-read",
    {
      title: "Watch Read",
      description:
        "Read and drain buffered events from a persistent WebSocket subscription.\n\nReturns all events accumulated since the last read, then clears the buffer.\n\nIf the subscription is not found, returns active subscriptions so you can pick the right one.",
      inputSchema: z.object({
        subscription_id: z
          .string()
          .describe("Subscription ID returned by pacifica-watch-start"),
      }),
    },
    async (params) => {
      logger.debug(params, "pacifica-watch-read invoked");
      try {
        const result = wsManager.read(params.subscription_id);
        if (!result) {
          const active = wsManager.listSubscriptions();
          return err(
            `Subscription "${params.subscription_id}" not found` +
              (active.length > 0
                ? `. Active subscriptions: ${JSON.stringify(active)}`
                : ". No active subscriptions."),
          );
        }

        // Extract channel name from subscription ID (e.g. "prices_1" → "prices")
        const channel = params.subscription_id.replace(/_\d+$/, "");
        const summary = summarizeEvents(
          channel,
          result.events,
          result.timeSpanMs,
        );

        return ok({
          events: result.events,
          count: result.count,
          time_span_ms: result.timeSpanMs,
          summary,
        });
      } catch (e) {
        logger.error({ err: e }, "pacifica-watch-read error");
        return err(String(e));
      }
    },
  );
}
