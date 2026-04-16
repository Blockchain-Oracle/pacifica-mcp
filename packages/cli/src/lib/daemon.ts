/**
 * CLI daemon lifecycle manager.
 *
 * The persistent watch-start/read/stop CLI commands need a background
 * process to keep the WebSocket alive between invocations. This module
 * handles spawning, reading events from, and killing that daemon.
 *
 * MCP tools don't use this — they use the in-memory WsManager directly.
 */

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, statSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const RUNTIME_DIR = join(tmpdir(), "pacifica-mcp");
const PID_FILE = join(RUNTIME_DIR, "daemon.pid");
const EVENTS_FILE = join(RUNTIME_DIR, "events.jsonl");
const SUBS_FILE = join(RUNTIME_DIR, "subs.json");

export function ensureRuntimeDir(): void {
  mkdirSync(RUNTIME_DIR, { recursive: true });
}

export function getEventsFile(): string {
  return EVENTS_FILE;
}

export function getSubsFile(): string {
  return SUBS_FILE;
}

/** Check if daemon is running. Returns PID or null. */
export function getDaemonPid(): number | null {
  try {
    const pid = parseInt(readFileSync(PID_FILE, "utf-8").trim(), 10);
    process.kill(pid, 0); // signal 0 = existence check
    return pid;
  } catch {
    try { unlinkSync(PID_FILE); } catch { /* ignore */ }
    return null;
  }
}

/** Spawn a detached daemon process. Returns the PID. */
export function spawnDaemon(
  channel: string,
  params: Record<string, unknown>,
  subId: string,
): number {
  ensureRuntimeDir();

  // Clear stale events file
  writeFileSync(EVENTS_FILE, "");

  // Resolve daemon-worker.js relative to this file
  const thisDir = dirname(fileURLToPath(import.meta.url));
  const daemonScript = join(thisDir, "daemon-worker.js");

  const child = spawn(process.execPath, [daemonScript], {
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PACIFICA_DAEMON_CHANNEL: channel,
      PACIFICA_DAEMON_PARAMS: JSON.stringify(params),
      PACIFICA_DAEMON_SUB_ID: subId,
      PACIFICA_DAEMON_RUNTIME_DIR: RUNTIME_DIR,
    },
  });

  child.unref();
  const pid = child.pid!;
  writeFileSync(PID_FILE, String(pid));
  writeFileSync(SUBS_FILE, JSON.stringify([{ id: subId, channel, params, createdAt: Date.now() }]));

  return pid;
}

/** Kill the daemon process. */
export function killDaemon(): boolean {
  const pid = getDaemonPid();
  if (pid === null) return false;
  try {
    process.kill(pid, "SIGTERM");
    try { unlinkSync(PID_FILE); } catch { /* ignore */ }
    try { unlinkSync(SUBS_FILE); } catch { /* ignore */ }
    try { unlinkSync(EVENTS_FILE); } catch { /* ignore */ }
    return true;
  } catch {
    return false;
  }
}

/** Read and drain all events from the JSONL file. */
export function readAndDrainEvents(): Array<{ channel: string; data: unknown; receivedAt: number }> {
  try {
    const raw = readFileSync(EVENTS_FILE, "utf-8");
    writeFileSync(EVENTS_FILE, ""); // truncate
    return raw.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

/** Read active subscriptions metadata. */
export function readSubs(): Array<{ id: string; channel: string; params: Record<string, unknown>; createdAt: number }> {
  try {
    return JSON.parse(readFileSync(SUBS_FILE, "utf-8"));
  } catch {
    return [];
  }
}
