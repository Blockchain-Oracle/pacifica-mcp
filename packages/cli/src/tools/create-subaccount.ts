import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair, saveSubaccountKey } from "../lib/wallet.js";
import { sortKeys } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

export function registerCreateSubaccountTool(server: McpServer): void {
  server.registerTool(
    "pacifica-create-subaccount",
    {
      title: "Create Subaccount",
      description:
        "Create a new subaccount under your main Pacifica account.\n\nGenerates a fresh Ed25519 keypair for the subaccount.\nBoth the main account and subaccount must sign the request (dual signature).\n\nRequires wallet — signs with your Ed25519 keypair.",
      inputSchema: z.object({}),
    },
    async () => {
      logger.debug("pacifica-create-subaccount invoked");
      try {
        const config = loadOrCreateWallet();
        const mainKeypair = getKeypair(config);

        // Generate fresh keypair for the subaccount
        const subKeypair = Keypair.generate();
        const subPublicKey = subKeypair.publicKey.toBase58();

        // Both signatures must share the same timestamp
        const timestamp = Date.now();
        const expiryWindow = 5000;

        // Step 1: Subaccount signs MAIN account's public key
        const subMessage = {
          timestamp,
          expiry_window: expiryWindow,
          type: "subaccount_initiate",
          data: { account: config.publicKey },
        };
        const subMsgStr = JSON.stringify(sortKeys(subMessage));
        const subSigBytes = nacl.sign.detached(
          new TextEncoder().encode(subMsgStr),
          subKeypair.secretKey,
        );
        const subSignature = bs58.encode(subSigBytes);

        // Step 2: Main account signs the subaccount's signature
        const mainMessage = {
          timestamp,
          expiry_window: expiryWindow,
          type: "subaccount_confirm",
          data: { signature: subSignature },
        };
        const mainMsgStr = JSON.stringify(sortKeys(mainMessage));
        const mainSigBytes = nacl.sign.detached(
          new TextEncoder().encode(mainMsgStr),
          mainKeypair.secretKey,
        );
        const mainSignature = bs58.encode(mainSigBytes);

        const result = await post<{ success: boolean }>(
          "/account/subaccount/create",
          {
            main_account: config.publicKey,
            subaccount: subPublicKey,
            main_signature: mainSignature,
            sub_signature: subSignature,
            timestamp,
            expiry_window: expiryWindow,
          },
        );

        // Save the subaccount key locally — never expose through AI context
        const keyPath = saveSubaccountKey(
          subPublicKey,
          bs58.encode(subKeypair.secretKey),
        );

        return ok({
          ...result,
          sub_account_public_key: subPublicKey,
          key_saved_to: keyPath,
          note: "Subaccount private key saved to local disk. It is NOT included in this response for security.",
        });
      } catch (e) {
        logger.error({ err: e }, "pacifica-create-subaccount error");
        return err(String(e));
      }
    },
  );
}
