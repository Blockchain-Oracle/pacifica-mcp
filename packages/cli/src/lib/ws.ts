import WebSocket from "ws";
import { logger } from "./logger.js";

export interface WsEvent {
  channel: string;
  data: unknown;
  receivedAt: number;
}

interface Subscription {
  id: string;
  channel: string;
  params: Record<string, unknown>;
  buffer: WsEvent[];
  createdAt: number;
  lastReadAt: number;
}

class WsManager {
  private static _instance: WsManager | null = null;
  private ws: WebSocket | null = null;
  private subs = new Map<string, Subscription>();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnecting = false;
  private subCounter = 0;
  private connectPromise: Promise<void> | null = null;

  // Limits
  private readonly MAX_BUFFER = 1000;
  private readonly MAX_SUBS = 10;
  private readonly HEARTBEAT_MS = 30_000;
  private readonly AUTO_EXPIRE_MS = 5 * 60 * 1000; // 5 minutes
  private readonly RECONNECT_DELAY_MS = 2000;

  static instance(): WsManager {
    if (!WsManager._instance) WsManager._instance = new WsManager();
    return WsManager._instance;
  }

  private getUrl(): string {
    const network = process.env.PACIFICA_NETWORK ?? "testnet";
    return network === "mainnet"
      ? "wss://ws.pacifica.fi/ws"
      : "wss://test-ws.pacifica.fi/ws";
  }

  private ensureConnected(): Promise<void> {
    // Already open
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    // Connection in progress — wait for it
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const url = this.getUrl();
      logger.info({ url }, "WebSocket connecting");

      this.ws = new WebSocket(url);

      this.ws.on("open", () => {
        logger.info("WebSocket connected");
        this.connectPromise = null;
        this.startHeartbeat();
        resolve();
      });

      this.ws.on("message", (raw: WebSocket.Data) => {
        try {
          this.handleMessage(raw.toString());
        } catch (e) {
          logger.error({ err: e }, "WebSocket message parse error");
        }
      });

      this.ws.on("close", (code: number, reason: Buffer) => {
        logger.warn(
          { code, reason: reason.toString() },
          "WebSocket closed",
        );
        this.connectPromise = null;
        this.stopHeartbeat();
        this.scheduleReconnect();
      });

      this.ws.on("error", (err: Error) => {
        logger.error({ err }, "WebSocket error");
        this.connectPromise = null;
        // If we haven't resolved yet, reject the connect promise
        reject(err);
      });
    });

    return this.connectPromise;
  }

  private handleMessage(raw: string): void {
    let parsed: { channel?: string; data?: unknown };
    try {
      parsed = JSON.parse(raw) as { channel?: string; data?: unknown };
    } catch {
      logger.warn({ raw: raw.slice(0, 200) }, "Unparseable WS message");
      return;
    }

    const channel = parsed.channel;
    if (!channel || channel === "pong") return;

    const event: WsEvent = {
      channel,
      data: parsed.data ?? parsed,
      receivedAt: Date.now(),
    };

    // Route to matching subscriptions
    for (const sub of this.subs.values()) {
      if (sub.channel === channel) {
        sub.buffer.push(event);
        // Ring buffer — drop oldest if over limit
        while (sub.buffer.length > this.MAX_BUFFER) {
          sub.buffer.shift();
        }
      }
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: "ping" }));
      }
    }, this.HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnecting || this.subs.size === 0) return;
    this.reconnecting = true;

    setTimeout(async () => {
      this.reconnecting = false;
      if (this.subs.size === 0) return;

      logger.info("WebSocket reconnecting...");
      try {
        await this.ensureConnected();
        // Resubscribe all active subscriptions
        for (const sub of this.subs.values()) {
          this.sendSubscribe(sub.channel, sub.params);
        }
        logger.info(
          { count: this.subs.size },
          "WebSocket reconnected, resubscribed",
        );
      } catch (e) {
        logger.error({ err: e }, "WebSocket reconnect failed");
        this.scheduleReconnect();
      }
    }, this.RECONNECT_DELAY_MS);
  }

  private sendSubscribe(channel: string, params: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          method: "subscribe",
          params: { source: channel, ...params },
        }),
      );
    }
  }

  private sendUnsubscribe(
    channel: string,
    params: Record<string, unknown>,
  ): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          method: "unsubscribe",
          params: { source: channel, ...params },
        }),
      );
    }
  }

  async subscribe(
    channel: string,
    params: Record<string, unknown>,
  ): Promise<string> {
    if (this.subs.size >= this.MAX_SUBS) {
      throw new Error(
        `Maximum subscriptions (${this.MAX_SUBS}) reached. Stop an existing one first.`,
      );
    }

    await this.ensureConnected();

    const id = `${channel}_${++this.subCounter}`;
    const sub: Subscription = {
      id,
      channel,
      params,
      buffer: [],
      createdAt: Date.now(),
      lastReadAt: Date.now(),
    };
    this.subs.set(id, sub);
    this.sendSubscribe(channel, params);

    logger.info({ id, channel, params }, "Subscribed");
    return id;
  }

  async snapshot(
    channel: string,
    params: Record<string, unknown>,
    durationMs: number,
  ): Promise<WsEvent[]> {
    const id = await this.subscribe(channel, params);

    await new Promise((resolve) => setTimeout(resolve, durationMs));

    const sub = this.subs.get(id);
    const events = sub ? [...sub.buffer] : [];

    this.unsubscribe(id);
    return events;
  }

  read(
    subId: string,
  ): { events: WsEvent[]; count: number; timeSpanMs: number } | null {
    const sub = this.subs.get(subId);
    if (!sub) return null;

    // Auto-expire check
    if (Date.now() - sub.lastReadAt > this.AUTO_EXPIRE_MS) {
      logger.warn({ id: subId }, "Subscription auto-expired (5 min idle)");
      this.unsubscribe(subId);
      return null;
    }

    const events = [...sub.buffer];
    sub.buffer = [];
    sub.lastReadAt = Date.now();

    const timeSpanMs =
      events.length >= 2
        ? events[events.length - 1].receivedAt - events[0].receivedAt
        : 0;

    return { events, count: events.length, timeSpanMs };
  }

  unsubscribe(subId: string): boolean {
    const sub = this.subs.get(subId);
    if (!sub) return false;

    this.sendUnsubscribe(sub.channel, sub.params);
    this.subs.delete(subId);

    logger.info({ id: subId }, "Unsubscribed");

    // If no remaining subs, close the WebSocket
    if (this.subs.size === 0) {
      this.close();
    }

    return true;
  }

  listSubscriptions(): {
    id: string;
    channel: string;
    buffered: number;
    age: string;
  }[] {
    const now = Date.now();
    const result: {
      id: string;
      channel: string;
      buffered: number;
      age: string;
    }[] = [];

    for (const sub of this.subs.values()) {
      const ageSec = Math.round((now - sub.createdAt) / 1000);
      const ageStr =
        ageSec < 60
          ? `${ageSec}s`
          : ageSec < 3600
            ? `${Math.floor(ageSec / 60)}m ${ageSec % 60}s`
            : `${Math.floor(ageSec / 3600)}h ${Math.floor((ageSec % 3600) / 60)}m`;

      result.push({
        id: sub.id,
        channel: sub.channel,
        buffered: sub.buffer.length,
        age: ageStr,
      });
    }

    return result;
  }

  close(): void {
    // Unsubscribe all without triggering reconnect
    for (const sub of this.subs.values()) {
      this.sendUnsubscribe(sub.channel, sub.params);
    }
    this.subs.clear();

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.removeAllListeners();
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.connectPromise = null;
    this.reconnecting = false;
    logger.info("WebSocket closed");
  }
}

export const wsManager = WsManager.instance();
