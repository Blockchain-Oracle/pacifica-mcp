import { Keypair } from "@solana/web3.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import bs58 from "bs58";
import { logger } from "./logger.js";

const CONFIG_DIR = join(homedir(), ".pacifica-mcp");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export interface PacificaConfig {
  privateKey: string; // base58
  publicKey: string; // base58
  network: "testnet" | "mainnet";
}

/**
 * Load existing config or generate a new Solana keypair on first run.
 * Supports PACIFICA_PRIVATE_KEY env var override.
 */
export function loadOrCreateWallet(): PacificaConfig {
  // Env override — use provided private key
  const envKey = process.env.PACIFICA_PRIVATE_KEY;
  if (envKey) {
    const secretKey = bs58.decode(envKey);
    const keypair = Keypair.fromSecretKey(secretKey);
    const network =
      (process.env.PACIFICA_NETWORK as "testnet" | "mainnet") ?? "testnet";
    logger.info("Using wallet from PACIFICA_PRIVATE_KEY env var");
    return {
      privateKey: envKey,
      publicKey: keypair.publicKey.toBase58(),
      network,
    };
  }

  // Load from disk
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as PacificaConfig;
  }

  // First run — generate new keypair
  const keypair = Keypair.generate();
  const network =
    (process.env.PACIFICA_NETWORK as "testnet" | "mainnet") ?? "testnet";

  const config: PacificaConfig = {
    privateKey: bs58.encode(keypair.secretKey),
    publicKey: keypair.publicKey.toBase58(),
    network,
  };

  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });

  process.stderr.write(
    "\n" +
      "PACIFICA MCP \u2014 First Run Setup\n" +
      "\u2500".repeat(50) +
      "\n\n" +
      `  Wallet:  ${config.publicKey}\n` +
      `  Network: ${config.network}\n` +
      `  Config:  ${CONFIG_PATH}\n\n` +
      "  To start trading, deposit funds on Pacifica:\n\n" +
      "  1. Copy your private key from the config file above\n" +
      "  2. Import it into Phantom or Backpack browser wallet\n" +
      "  3. Go to https://test-app.pacifica.fi (code: Pacifica)\n" +
      "  4. Connect wallet and deposit SOL, USDC, or other assets\n\n" +
      "  Docs: https://docs.pacifica-mcp.xyz/guides/testnet\n\n" +
      "\u2500".repeat(50) +
      "\n\n",
  );

  logger.info({ publicKey: config.publicKey }, "New Solana wallet generated");
  return config;
}

/**
 * Get the Solana Keypair from a PacificaConfig.
 */
export function getKeypair(config: PacificaConfig): Keypair {
  return Keypair.fromSecretKey(bs58.decode(config.privateKey));
}

/**
 * Get the raw 64-byte secret key for Ed25519 signing.
 */
export function getSecretKey(config: PacificaConfig): Uint8Array {
  return bs58.decode(config.privateKey);
}

/**
 * Save a subaccount keypair to ~/.pacifica-mcp/subaccounts/<address>.json
 * The private key is stored locally — never returned through the AI context.
 */
export function saveSubaccountKey(
  publicKey: string,
  privateKey: string,
): string {
  const subDir = join(CONFIG_DIR, "subaccounts");
  mkdirSync(subDir, { recursive: true });

  const filePath = join(subDir, `${publicKey}.json`);
  writeFileSync(
    filePath,
    JSON.stringify({ publicKey, privateKey, createdAt: new Date().toISOString() }, null, 2),
    { mode: 0o600 },
  );

  logger.info({ publicKey, path: filePath }, "Subaccount key saved");
  return filePath;
}

/**
 * Load a subaccount keypair from local storage.
 */
export function loadSubaccountKey(publicKey: string): { publicKey: string; privateKey: string; createdAt?: string } | null {
  const filePath = join(CONFIG_DIR, "subaccounts", `${publicKey}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

/**
 * List all locally saved subaccount public keys.
 */
export function listLocalSubaccounts(): { publicKey: string; createdAt?: string }[] {
  const subDir = join(CONFIG_DIR, "subaccounts");
  if (!existsSync(subDir)) return [];

  const results: { publicKey: string; createdAt?: string }[] = [];
  for (const f of readdirSync(subDir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const data = JSON.parse(readFileSync(join(subDir, f), "utf-8")) as {
        publicKey: string;
        createdAt?: string;
      };
      results.push({ publicKey: data.publicKey, createdAt: data.createdAt });
    } catch {
      // skip corrupted files
    }
  }
  return results;
}

/**
 * Get a Keypair for a subaccount by its public key.
 * Returns null if the subaccount key isn't stored locally.
 */
export function getSubaccountKeypair(publicKey: string): Keypair | null {
  const data = loadSubaccountKey(publicKey);
  if (!data) return null;
  return Keypair.fromSecretKey(bs58.decode(data.privateKey));
}
