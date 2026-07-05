import { createPublicClient, http, parseAbiItem, type Address, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { loadConfig } from "../src/config.js";
import { ZamaOfficerDecryptor } from "../src/officer.js";
import { FlutterwaveProvider } from "../src/providers/flutterwave.js";
import { loadBeneficiaries } from "../src/beneficiary.js";
import { processSettlement } from "../src/listener.js";

const SETTLED = parseAbiItem(
  "event Settled(bytes32 indexed id, uint256 indexed nonce, bytes32 receipt, bytes32 outcomeHandle)",
);
const CORRIDOR_TRANSFER = parseAbiItem(
  "event CorridorTransfer(address indexed sender, address indexed recipient, uint256 indexed nonce)",
);

async function main() {
  const block = process.argv[2] ? BigInt(process.argv[2]) : undefined;
  if (block === undefined) throw new Error("Usage: tsx scripts/process-corridor-block.ts <block>");

  const cfg = loadConfig();
  if (!cfg.flutterwave.secretKey.includes("_TEST")) {
    throw new Error("Refusing a non-test Flutterwave secret key.");
  }

  const client = createPublicClient({ chain: sepolia, transport: http(cfg.chain.rpcUrl) });
  const [transferLogs, settledLogs] = await Promise.all([
    client.getLogs({
      address: cfg.chain.corridorAddress,
      event: CORRIDOR_TRANSFER,
      fromBlock: block,
      toBlock: block,
    }),
    client.getLogs({
      address: cfg.chain.engineAddress,
      event: SETTLED,
      fromBlock: block,
      toBlock: block,
    }),
  ]);

  const partiesByNonce = new Map<string, { sender: Address; recipient: Address }>();
  for (const log of transferLogs) {
    const { sender, recipient, nonce } = log.args as {
      sender: Address;
      recipient: Address;
      nonce: bigint;
    };
    partiesByNonce.set(nonce.toString(), { sender, recipient });
  }

  const deps = {
    cfg,
    decryptor: new ZamaOfficerDecryptor(cfg),
    provider: new FlutterwaveProvider(cfg.flutterwave),
    beneficiaries: loadBeneficiaries(cfg.beneficiariesJson),
  };

  for (const log of settledLogs) {
    const { nonce, outcomeHandle } = log.args as { nonce: bigint; outcomeHandle: Hex };
    const transferNonce = nonce > 0n ? nonce - 1n : nonce;
    const parties = partiesByNonce.get(transferNonce.toString());
    if (!parties) {
      console.warn(`missing CorridorTransfer for transfer nonce ${transferNonce}`);
      continue;
    }
    const out = await processSettlement(deps, { nonce: transferNonce, outcomeHandle, ...parties });
    console.log(JSON.stringify({ transferNonce: transferNonce.toString(), outcome: out }, null, 2));
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
