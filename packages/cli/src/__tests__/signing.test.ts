import { describe, it, expect } from "vitest";
import { signRequest } from "../lib/signing.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

describe("signRequest", () => {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();

  it("returns a valid base58 signature", () => {
    const result = signRequest(
      "create_order",
      { symbol: "BTC", amount: "0.1", side: "bid" },
      keypair.secretKey,
      publicKey,
    );

    expect(result.signature).toBeTruthy();
    expect(result.timestamp).toBeGreaterThan(0);
    expect(result.account).toBe(publicKey);

    // Should be valid base58
    const decoded = bs58.decode(result.signature);
    expect(decoded.length).toBe(64); // Ed25519 signature is 64 bytes
  });

  it("produces a verifiable Ed25519 signature", () => {
    const data = { symbol: "ETH", price: "2000", amount: "1" };
    const result = signRequest("create_order", data, keypair.secretKey, publicKey);

    // Reconstruct the signed message the same way signing.ts does
    const message = {
      timestamp: result.timestamp,
      expiry_window: result.expiry_window,
      type: "create_order",
      data,
    };

    // Recursive sort
    function sortKeys(obj: unknown): unknown {
      if (Array.isArray(obj)) return obj.map(sortKeys);
      if (obj !== null && typeof obj === "object") {
        return Object.keys(obj as Record<string, unknown>)
          .sort()
          .reduce((sorted, key) => {
            sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
            return sorted;
          }, {} as Record<string, unknown>);
      }
      return obj;
    }

    const sorted = sortKeys(message);
    const messageBytes = new TextEncoder().encode(JSON.stringify(sorted));
    const signatureBytes = bs58.decode(result.signature);

    // Verify the signature
    const valid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      keypair.publicKey.toBytes(),
    );

    expect(valid).toBe(true);
  });

  it("flattens data fields in the returned request", () => {
    const result = signRequest(
      "update_leverage",
      { symbol: "SOL", leverage: 10 },
      keypair.secretKey,
      publicKey,
    );

    // Data fields should be at top level, not nested under "data"
    expect(result.symbol).toBe("SOL");
    expect(result.leverage).toBe(10);
    expect(result).not.toHaveProperty("data");
  });

  it("includes agent_wallet when provided", () => {
    const agentKeypair = Keypair.generate();
    const agentPubkey = agentKeypair.publicKey.toBase58();

    const result = signRequest(
      "create_order",
      { symbol: "BTC" },
      keypair.secretKey,
      publicKey,
      agentPubkey,
    );

    expect(result.agent_wallet).toBe(agentPubkey);
  });

  it("sets agent_wallet to null when not provided", () => {
    const result = signRequest(
      "create_order",
      { symbol: "BTC" },
      keypair.secretKey,
      publicKey,
    );

    expect(result.agent_wallet).toBeNull();
  });
});
