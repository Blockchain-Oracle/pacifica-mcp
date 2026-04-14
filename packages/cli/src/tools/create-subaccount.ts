import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { post } from "../lib/api.js";
import { ok, err } from "../lib/format.js";
import { loadOrCreateWallet, getKeypair, saveSubaccountKey } from "../lib/wallet.js";
import { signRequest } from "../lib/signing.js";
import { logger } from "../lib/logger.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

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

        // Sign from the main account
        const mainSigned = signRequest(
          "create_subaccount",
          { sub_account: subPublicKey },
          mainKeypair.secretKey,
          config.publicKey,
        );

        // Sign from the subaccount
        const subSigned = signRequest(
          "create_subaccount",
          { sub_account: subPublicKey },
          subKeypair.secretKey,
          subPublicKey,
        );

        const result = await post<{ success: boolean }>(
          "/account/subaccount/create",
          {
            main_account_signature: mainSigned.signature,
            sub_account_signature: subSigned.signature,
            account: config.publicKey,
            sub_account: subPublicKey,
            timestamp: mainSigned.timestamp,
            expiry_window: mainSigned.expiry_window,
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
