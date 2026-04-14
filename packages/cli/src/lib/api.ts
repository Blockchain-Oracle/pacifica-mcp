import { logger } from "./logger.js";

const BASES: Record<string, string> = {
  mainnet: "https://api.pacifica.fi/api/v1",
  testnet: "https://test-api.pacifica.fi/api/v1",
};

/** Get base URL from env (defaults to testnet). */
export function baseUrl(): string {
  const network = process.env.PACIFICA_NETWORK ?? "testnet";
  const url = BASES[network];
  if (!url) {
    throw new Error(
      `Unknown PACIFICA_NETWORK "${network}". Use "mainnet" or "testnet".`,
    );
  }
  return url;
}

/**
 * GET with Pacifica response unwrapping.
 * Pacifica wraps all responses: `{success, data, error, code}`.
 */
export async function get<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${baseUrl()}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  logger.debug({ url: url.toString() }, "GET");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Pacifica API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    success: boolean;
    data: T;
    error?: string;
    code?: number;
  };

  if (!json.success) {
    throw new Error(`Pacifica API error: ${json.error ?? "unknown"}`);
  }

  return json.data;
}

/**
 * POST with Pacifica response unwrapping.
 * Takes a pre-signed payload (see signing.ts).
 */
export async function post<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const url = `${baseUrl()}${path}`;

  logger.debug({ url }, "POST");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Pacifica API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    success: boolean;
    data: T;
    error?: string;
    code?: number;
  };

  if (!json.success) {
    throw new Error(`Pacifica API error: ${json.error ?? "unknown"}`);
  }

  return json.data;
}
