import { describe, it, expect, afterAll } from "vitest";
import { wsManager } from "../lib/ws.js";

describe("WsManager", () => {
  afterAll(() => {
    wsManager.close();
  });

  it("starts with no subscriptions", () => {
    const subs = wsManager.listSubscriptions();
    expect(subs).toEqual([]);
  });

  it("snapshot connects and receives real price data", async () => {
    const events = await wsManager.snapshot(
      "prices",
      { source: "prices" },
      2000,
    );

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].channel).toBe("prices");
    expect(events[0].receivedAt).toBeGreaterThan(0);
    expect(events[0].data).toBeTruthy();
  }, 15000);

  it("subscribe creates a subscription and buffers events", async () => {
    const id = await wsManager.subscribe("prices", { source: "prices" });

    expect(id).toContain("prices");
    expect(wsManager.listSubscriptions().some((s) => s.id === id)).toBe(true);

    // Wait for events
    await new Promise((r) => setTimeout(r, 2000));

    const result = wsManager.read(id);
    expect(result).not.toBeNull();
    expect(result!.events.length).toBeGreaterThanOrEqual(1);
    expect(result!.count).toBeGreaterThanOrEqual(1);

    // Second read — buffer drained
    const result2 = wsManager.read(id);
    expect(result2!.events.length).toBe(0);

    wsManager.unsubscribe(id);
  }, 15000);

  it("unsubscribe removes the subscription", async () => {
    const id = await wsManager.subscribe("prices", { source: "prices" });
    wsManager.unsubscribe(id);
    expect(wsManager.listSubscriptions().some((s) => s.id === id)).toBe(false);
  }, 10000);

  it("read returns null for unknown subscription", () => {
    const result = wsManager.read("nonexistent_123");
    expect(result).toBeNull();
  });
});
