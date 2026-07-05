/**
 * Sender tool — submit an encrypted transfer to a Corridor.
 *
 * Encrypts the amount client-side (bound to (corridor, sender)) and calls `Corridor.transfer` at
 * the current mandate nonce. The corridor adjudicates it against the sealed rulebook and settles to
 * an encrypted outcome; whether it cleared is sealed — only the compliance officer can decrypt it.
 *
 * Usage: pnpm --filter @cloistra/offramp exec tsx scripts/send-transfer.ts <amount> [recipient]
 * Env:   SENDER_PRIVATE_KEY (falls back to DEPLOYER_PRIVATE_KEY) plus the chain vars from loadConfig.
 */
import { bytesToHex, getAddress, type Address, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { loadConfig } from "../src/config.js";
import { makeWriter, confirm } from "./lib/writer.js";
import { engineAbi, corridorAbi } from "./lib/abi.js";
import { requireKey, requireAmount, optionalAddress } from "./lib/args.js";

const DEFAULT_RECIPIENT = "0x0000000000000000000000000000000000000001" as Address;
// See fund-custody.ts: FHE-touching txs are modest on Sepolia; cap well below the block limit.
const TRANSFER_GAS = 3_000_000n;

async function main() {
  const amount = requireAmount(process.argv[2], "send-transfer.ts <amount> [recipient]");
  const recipient = optionalAddress(process.argv[3]) ?? DEFAULT_RECIPIENT;
  const cfg = loadConfig();
  const key = process.env.SENDER_PRIVATE_KEY?.trim() || requireKey("DEPLOYER_PRIVATE_KEY");
  const w = makeWriter(key as Hex, cfg.chain.rpcUrl);
  const { account, publicClient, walletClient } = w;
  const sender = account.address;
  const { engineAddress: engine, corridorAddress: corridor } = cfg.chain;

  try {
    const mandateId = (await publicClient.readContract({
      address: corridor,
      abi: corridorAbi,
      functionName: "mandateId",
    })) as Hex;
    const nonce = (await publicClient.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "mandateNonce",
      args: [mandateId],
    })) as bigint;

    // Encrypt the amount (bound to corridor + sender) and submit it at the current mandate nonce.
    const enc = await w.relayer.encrypt({
      values: [{ value: amount, type: "euint64" }],
      contractAddress: corridor,
      userAddress: sender,
    });
    const receipt = await confirm(
      publicClient,
      "transfer",
      await walletClient.writeContract({
        account,
        chain: sepolia,
        address: corridor,
        abi: corridorAbi,
        functionName: "transfer",
        args: [
          nonce,
          getAddress(recipient),
          bytesToHex(enc.handles[0]!),
          bytesToHex(enc.inputProof),
        ],
        gas: TRANSFER_GAS,
      }),
    );

    console.log(
      `transfer of ${amount} to ${recipient} settled in block ${receipt.blockNumber} (clientNonce ${nonce})`,
    );
    console.log(
      `process the settlement: pnpm --filter @cloistra/offramp exec tsx scripts/process-corridor-block.ts ${receipt.blockNumber}`,
    );
  } finally {
    w.dispose();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
