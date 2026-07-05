/**
 * Operator tool — fund a mandate's sealed custody.
 *
 * Mints the demo custody token to the operator, authorizes the engine as the ERC-7984 operator,
 * then pulls an encrypted amount into the mandate's sealed custody (`Cloistra.fund`). The amount is
 * encrypted client-side and bound to (engine, operator).
 *
 * Usage: pnpm --filter @cloistra/offramp exec tsx scripts/fund-custody.ts <amount>
 * Env:   DEPLOYER_PRIVATE_KEY (the mandate principal) plus the chain vars read by loadConfig.
 */
import { bytesToHex, type Address, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { loadConfig } from "../src/config.js";
import { makeWriter, confirm } from "./lib/writer.js";
import { engineAbi, corridorAbi, tokenAbi } from "./lib/abi.js";
import { requireKey, requireAmount } from "./lib/args.js";

const OPERATOR_WINDOW_SECONDS = 24 * 60 * 60;
// FHE-touching txs are modest on Sepolia (the coprocessor runs off-chain); cap them well below the
// block limit so the EIP-1559 upfront reservation (gasLimit × maxFeePerGas) stays small.
const MINT_GAS = 1_500_000n;
const FUND_GAS = 3_000_000n;

async function main() {
  const amount = requireAmount(process.argv[2], "fund-custody.ts <amount>");
  const cfg = loadConfig();
  const w = makeWriter(requireKey("DEPLOYER_PRIVATE_KEY"), cfg.chain.rpcUrl);
  const { account, publicClient, walletClient } = w;
  const operator = account.address;
  const { engineAddress: engine, corridorAddress: corridor } = cfg.chain;

  try {
    const mandateId = (await publicClient.readContract({
      address: corridor,
      abi: corridorAbi,
      functionName: "mandateId",
    })) as Hex;
    const token = (await publicClient.readContract({
      address: engine,
      abi: engineAbi,
      functionName: "mandateToken",
      args: [mandateId],
    })) as Address;

    // Mint the operator enough custody token to fund from (cleartext demo mint).
    await confirm(
      publicClient,
      "mint",
      await walletClient.writeContract({
        account,
        chain: sepolia,
        address: token,
        abi: tokenAbi,
        functionName: "mint",
        args: [operator, amount],
        gas: MINT_GAS,
      }),
    );

    // Authorize the engine to pull the amount via confidentialTransferFrom.
    const until = Math.floor(Date.now() / 1000) + OPERATOR_WINDOW_SECONDS;
    await confirm(
      publicClient,
      "setOperator",
      await walletClient.writeContract({
        account,
        chain: sepolia,
        address: token,
        abi: tokenAbi,
        functionName: "setOperator",
        args: [engine, until],
      }),
    );

    // Encrypt the amount (bound to engine + operator) and pull it into sealed custody.
    const enc = await w.relayer.encrypt({
      values: [{ value: amount, type: "euint64" }],
      contractAddress: engine,
      userAddress: operator,
    });
    const receipt = await confirm(
      publicClient,
      "fund",
      await walletClient.writeContract({
        account,
        chain: sepolia,
        address: engine,
        abi: engineAbi,
        functionName: "fund",
        args: [mandateId, bytesToHex(enc.handles[0]!), bytesToHex(enc.inputProof)],
        gas: FUND_GAS,
      }),
    );

    console.log(
      `funded ${amount} into sealed custody for mandate ${mandateId} (block ${receipt.blockNumber})`,
    );
  } finally {
    w.dispose();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
