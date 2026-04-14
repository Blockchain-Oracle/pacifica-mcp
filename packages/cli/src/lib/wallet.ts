import { Keypair } from "@solana/web3.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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
      "PACIFICA MCP — First Run Setup\n" +
      "\u2500".repeat(34) +
      "\n\n" +
      `  Wallet:  ${config.publicKey}\n` +
      `  Network: ${config.network}\n\n` +
      "  Config:  " +
      CONFIG_PATH +
      "\n\n" +
      "  Fund this wallet on Pacifica to start trading.\n" +
      "  Docs: https://pacifica.gitbook.io/docs\n\n" +
      "\u2500".repeat(34) +
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
export function loadSubaccountKey(publicKey: string): { publicKey: string; privateKey: string } | null {
  const filePath = join(CONFIG_DIR, "subaccounts", `${publicKey}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf-8"));
}
