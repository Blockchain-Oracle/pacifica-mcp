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
        "Read and drain buffered events from a persistent WebSocket subscription.\n\nUse summary_only=true to get aggregated metrics without raw events (recommended for prices channel to avoid data flooding).\n\nClears the buffer after reading.\n\nIf the subscription is not found, returns active subscriptions so you can pick the right one.",
      inputSchema: z.object({
        subscription_id: z
          .string()
          .describe("Subscription ID returned by pacifica-watch-start"),
        summary_only: z
          .boolean()
          .default(false)
          .describe(
            "If true, return only the summary without raw events. Recommended for prices channel.",
          ),
        max_events: z
          .number()
          .int()
          .min(1)
          .max(10000)
          .default(100)
          .describe(
            "Maximum number of raw events to return (default 100). Ignored when summary_only is true.",
          ),
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

        const channel = params.subscription_id.replace(/_\d+$/, "");
        const summary = summarizeEvents(
          channel,
          result.events,
          result.timeSpanMs,
        );

        if (params.summary_only) {
          return ok({
            count: result.count,
            time_span_ms: result.timeSpanMs,
            summary,
          });
        }

        const capped = result.events.slice(0, params.max_events);
        const dropped = result.events.length - capped.length;

        return ok({
          events: capped,
          count: result.count,
          events_returned: capped.length,
          events_dropped: dropped,
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
