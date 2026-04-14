import { describe, it, expect } from "vitest";
import { ok, err } from "../lib/format.js";

describe("format", () => {
  describe("ok", () => {
    it("returns a non-error result with JSON text", () => {
      const result = ok({ price: "71000", symbol: "BTC" });

      expect(result.isError).toBe(false);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.price).toBe("71000");
      expect(parsed.symbol).toBe("BTC");
    });

    it("handles arrays", () => {
      const result = ok([1, 2, 3]);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual([1, 2, 3]);
    });

    it("handles null", () => {
      const result = ok(null);
      expect(result.content[0].text).toBe("null");
    });
  });

  describe("err", () => {
    it("returns an error result with message", () => {
      const result = err("Something went wrong");

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe("Error: Something went wrong");
    });
  });
});
