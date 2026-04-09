import nacl from "tweetnacl";
import bs58 from "bs58";

export interface SignedRequest {
  account: string;
  agent_wallet: string | null;
  signature: string;
  timestamp: number;
  expiry_window: number;
  [key: string]: unknown;
}

/**
 * Recursively sort all keys alphabetically at every level of an object.
 * Arrays are preserved in order but their object elements are sorted.
 */
function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce(
        (sorted, key) => {
          sorted[key] = sortKeys((obj as Record<string, unknown>)[key]);
          return sorted;
        },
        {} as Record<string, unknown>,
      );
  }
  return obj;
}

/**
 * Sign a request for the Pacifica API.
 *
 * 1. Build header: {timestamp, expiry_window, type}
 * 2. Build message: {...header, data: payload}
 * 3. Recursively sort all keys
 * 4. Compact JSON.stringify (no whitespace)
 * 5. Sign UTF-8 bytes with Ed25519 (nacl.sign.detached)
 * 6. Base58 encode the signature
 * 7. Return flattened POST body (data fields at top level, not nested)
 */
export function signRequest(
  operationType: string,
  data: Record<string, unknown>,
  secretKey: Uint8Array,
  publicKey: string,
  agentWallet?: string,
): SignedRequest {
  const timestamp = Date.now();
  const expiryWindow = 5000;

  // Build the message to sign (nested format)
  const message = {
    timestamp,
    expiry_window: expiryWindow,
    type: operationType,
    data,
  };

  // Sort keys recursively and compact-stringify
  const sorted = sortKeys(message);
  const messageStr = JSON.stringify(sorted);
  const messageBytes = new TextEncoder().encode(messageStr);

  // Ed25519 detached signature
  const signatureBytes = nacl.sign.detached(messageBytes, secretKey);
  const signature = bs58.encode(signatureBytes);

  // Return flattened body — data fields at top level
  return {
    account: publicKey,
    agent_wallet: agentWallet ?? null,
    signature,
    timestamp,
    expiry_window: expiryWindow,
    ...data,
  };
}
