/**
 * Officer tool — decrypt and print a mandate's sealed policy: per-transfer cap, total cap,
 * drawdown %, velocity ceiling, custody balance, high-water mark, cumulative spent, and optionally
 * one sender's running velocity total. Read-only. Only the compliance officer holds the ACL grants
 * over these handles, so this runs with the officer key.
 *
 * Usage: pnpm --filter @cloistra/offramp exec tsx scripts/read-policy.ts [senderAddress]
 */
import { createPublicClient, http, type Address, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { loadConfig } from "../src/config.js";
import { ZamaOfficerDecryptor } from "../src/officer.js";
import { engineAbi, corridorAbi } from "./lib/abi.js";
import { optionalAddress } from "./lib/args.js";

const ZERO_HANDLE = `0x${"00".repeat(32)}` as Hex;

async function main() {
  const cfg = loadConfig();
  const sender = optionalAddress(process.argv[2]);

  const client = createPublicClient({ chain: sepolia, transport: http(cfg.chain.rpcUrl) });
  const { engineAddress: engine, corridorAddress: corridor } = cfg.chain;

  const mandateId = (await client.readContract({
    address: corridor,
    abi: corridorAbi,
    functionName: "mandateId",
  })) as Hex;
  const [perTradeCap, totalCap, drawdownPct] = (await client.readContract({
    address: engine,
    abi: engineAbi,
    functionName: "sealedLimits",
    args: [mandateId],
  })) as [Hex, Hex, Hex];
  const [spent, custody, highWaterMark] = (await client.readContract({
    address: engine,
    abi: engineAbi,
    functionName: "sealedState",
    args: [mandateId],
  })) as [Hex, Hex, Hex];
  const ceiling = (await client.readContract({
    address: corridor,
    abi: corridorAbi,
    functionName: "sealedCeiling",
  })) as Hex;
  const senderSpent = sender
    ? ((await client.readContract({
        address: corridor,
        abi: corridorAbi,
        functionName: "sealedSpent",
        args: [sender],
      })) as Hex)
    : undefined;

  const officer = new ZamaOfficerDecryptor(cfg);
  const show = async (label: string, handle: Hex | undefined, contract: Address) => {
    if (!handle || handle === ZERO_HANDLE) return console.log(`${label.padEnd(22)} = <unset>`);
    try {
      console.log(`${label.padEnd(22)} = ${await officer.decryptMoved(handle, contract)}`);
    } catch (e) {
      console.log(`${label.padEnd(22)} = <decrypt failed: ${(e as Error).message}>`);
    }
  };

  console.log(`mandateId = ${mandateId}`);
  await show("per-transfer cap", perTradeCap, engine);
  await show("total cap", totalCap, engine);
  await show("drawdown %", drawdownPct, engine);
  await show("velocity ceiling", ceiling, corridor);
  await show("custody", custody, engine);
  await show("high-water mark", highWaterMark, engine);
  await show("cumulative spent", spent, engine);
  if (sender) await show(`sender spent ${sender.slice(0, 8)}`, senderSpent, corridor);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
