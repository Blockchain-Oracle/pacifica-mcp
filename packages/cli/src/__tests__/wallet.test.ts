import { describe, it, expect, afterAll } from "vitest";
import { existsSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { saveSubaccountKey, loadSubaccountKey } from "../lib/wallet.js";

const CONFIG_DIR = join(homedir(), ".pacifica-mcp");
const SUB_DIR = join(CONFIG_DIR, "subaccounts");

describe("wallet — subaccount key storage", () => {
  const testPubkey = "TestSubaccountPublicKey123456789";
  const testPrivkey = "TestSubaccountPrivateKey123456789";

  afterAll(() => {
    // Clean up test file
    const testFile = join(SUB_DIR, `${testPubkey}.json`);
    if (existsSync(testFile)) rmSync(testFile);
  });

  it("saves a subaccount key to disk", () => {
    const path = saveSubaccountKey(testPubkey, testPrivkey);

    expect(path).toContain(testPubkey);
    expect(existsSync(path)).toBe(true);
  });

  it("loads a saved subaccount key", () => {
    const loaded = loadSubaccountKey(testPubkey);

    expect(loaded).not.toBeNull();
    expect(loaded!.publicKey).toBe(testPubkey);
    expect(loaded!.privateKey).toBe(testPrivkey);
  });

  it("returns null for non-existent subaccount", () => {
    const loaded = loadSubaccountKey("NonExistentKey");
    expect(loaded).toBeNull();
  });
});
