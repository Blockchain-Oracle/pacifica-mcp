#!/usr/bin/env node
/**
 * Detached daemon process for CLI persistent WebSocket subscriptions.
 *
 * Spawned by `pacifica watch-start`, killed by `pacifica watch-stop`.
 * Maintains a WebSocket connection and writes events to a JSONL file
 * that `pacifica watch-read` can consume.
 *
 * Auto-expires after 10 minutes of no reads.
 */

import WebSocket from "ws";
import { readFileSync, writeFileSync, appendFileSync, unlinkSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const channel = process.env.PACIFICA_DAEMON_CHANNEL!;
const params = JSON.parse(process.env.PACIFICA_DAEMON_PARAMS ?? "{}");
const subId = process.env.PACIFICA_DAEMON_SUB_ID!;
const runtimeDir = process.env.PACIFICA_DAEMON_RUNTIME_DIR!;

const EVENTS_FILE = join(runtimeDir, "events.jsonl");
const PID_FILE = join(runtimeDir, "daemon.pid");
const SUBS_FILE = join(runtimeDir, "subs.json");
const HEARTBEAT_MS = 30_000;
const MAX_FILE_LINES = 5_000;
const AUTO_EXPIRE_MS = 10 * 60 * 1000; // 10 minutes

const network = process.env.PACIFICA_NETWORK ?? "testnet";
const wsUrl = network === "mainnet"
  ? "wss://ws.pacifica.fi/ws"
  : "wss://test-ws.pacifica.fi/ws";

let lineCount = 0;
let lastFileSize = -1;

function appendEvent(data: unknown): void {
  const event = { channel, data, receivedAt: Date.now() };
  appendFileSync(EVENTS_FILE, JSON.stringify(event) + "\n");
  lineCount++;

  // Prevent unbounded growth
  if (lineCount > MAX_FILE_LINES) {
    try {
      const lines = readFileSync(EVENTS_FILE, "utf-8").split("\n").filter(Boolean);
      const keep = lines.slice(-Math.floor(MAX_FILE_LINES / 2));
      writeFileSync(EVENTS_FILE, keep.join("\n") + "\n");
      lineCount = keep.length;
    } catch { /* ignore */ }
  }
}

function cleanup(): void {
  try { unlinkSync(PID_FILE); } catch { /* ignore */ }
  try { unlinkSync(SUBS_FILE); } catch { /* ignore */ }
}

function connect(): void {
  const ws = new WebSocket(wsUrl);

  ws.on("open", () => {
    ws.send(JSON.stringify({
      method: "subscribe",
      params: { source: channel, ...params },
    }));
  });

  const hb = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ method: "ping" }));
    }
  }, HEARTBEAT_MS);

  // Auto-expire: if events file hasn't been read (truncated) in 10 min, die
  const expireCheck = setInterval(() => {
    try {
      const stat = statSync(EVENTS_FILE);
      if (lastFileSize === -1) {
        lastFileSize = stat.size;
      } else if (stat.size >= lastFileSize && stat.size > 0) {
        // File is growing or unchanged — nobody reading
        if (Date.now() - stat.mtimeMs > AUTO_EXPIRE_MS) {
          clearInterval(hb);
          clearInterval(expireCheck);
          cleanup();
          ws.close();
          process.exit(0);
        }
      } else {
        // File was truncated (someone read it)
        lastFileSize = stat.size;
      }
    } catch { /* ignore */ }
  }, 60_000);

  ws.on("message", (raw) => {
    try {
      const parsed = JSON.parse(raw.toString());
      if (parsed.channel && parsed.channel !== "pong") {
        appendEvent(parsed.data ?? parsed);
      }
    } catch { /* ignore */ }
  });

  ws.on("close", () => {
    clearInterval(hb);
    clearInterval(expireCheck);
    // Reconnect after 2s
    setTimeout(connect, 2000);
  });

  ws.on("error", () => {
    // Will trigger close → reconnect
  });
}

process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});

// Initialize
if (!existsSync(EVENTS_FILE)) {
  writeFileSync(EVENTS_FILE, "");
}

connect();
