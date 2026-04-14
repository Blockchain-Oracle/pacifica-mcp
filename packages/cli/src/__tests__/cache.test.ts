import { describe, it, expect, vi, beforeEach } from "vitest";
import { withCache } from "../lib/cache.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

describe("cache", () => {
  const mockResult: CallToolResult = {
    content: [{ type: "text", text: '{"data":"test"}' }],
    isError: false,
  };

  it("calls the function on first invocation", async () => {
    const fn = vi.fn().mockResolvedValue(mockResult);

    const result = await withCache("test-tool", { key: "unique1" }, fn);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.isError).toBe(false);
  });

  it("returns cached result on second call with same params", async () => {
    const fn = vi.fn().mockResolvedValue(mockResult);
    const params = { key: "unique2" };

    await withCache("test-tool", params, fn);
    const second = await withCache("test-tool", params, fn);

    expect(fn).toHaveBeenCalledTimes(1); // only called once
    expect(second.content[0].text).toContain("[cached");
  });

  it("calls function again with different params", async () => {
    const fn = vi.fn().mockResolvedValue(mockResult);

    await withCache("test-tool", { key: "a" }, fn);
    await withCache("test-tool", { key: "b" }, fn);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not cache error results", async () => {
    const errorResult: CallToolResult = {
      content: [{ type: "text", text: "Error: failed" }],
      isError: true,
    };
    const fn = vi.fn().mockResolvedValue(errorResult);
    const params = { key: "error-test" };

    await withCache("test-tool", params, fn);
    await withCache("test-tool", params, fn);

    expect(fn).toHaveBeenCalledTimes(2); // not cached
  });
});
