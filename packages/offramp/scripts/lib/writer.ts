import {
  createPublicClient,
  createWalletClient,
  http,
  type Hex,
  type PublicClient,
  type TransactionReceipt,
  type WalletClient,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { MemoryStorage, SepoliaConfig, ZamaSDK } from "@zama-fhe/sdk";
import { RelayerNode } from "@zama-fhe/sdk/node";
import { ViemSigner } from "@zama-fhe/sdk/viem";

/**
 * A viem wallet plus a @zama-fhe/sdk context keyed to one signer, for writing sealed inputs on
 * Sepolia. Encryption lives on the relayer (`relayer.encrypt({ values, contractAddress,
 * userAddress })`); the SDK carries the officer read path. Reuse one instance across a run so the
 * FHE WASM loads once.
 */
export type Writer = {
  account: PrivateKeyAccount;
  publicClient: PublicClient;
  walletClient: WalletClient;
  sdk: ZamaSDK;
  relayer: RelayerNode;
  /** Terminate the relayer worker pool so the process can exit. */
  dispose(): void;
};

export function makeWriter(privateKey: Hex, rpcUrl: string): Writer {
  const key = (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as Hex;
  const account = privateKeyToAccount(key);
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({ chain: sepolia, transport });
  const walletClient = createWalletClient({ account, chain: sepolia, transport });

  const relayer = new RelayerNode({
    transports: { [SepoliaConfig.chainId]: SepoliaConfig },
    getChainId: async () => SepoliaConfig.chainId,
    poolSize: 1,
  });
  const signer = new ViemSigner({ walletClient, publicClient });
  const sdk = new ZamaSDK({ relayer, signer, storage: new MemoryStorage() });

  return {
    account,
    publicClient,
    walletClient,
    sdk,
    relayer,
    dispose: () => sdk.terminate?.(),
  };
}

/** Await a transaction and throw if it reverted. */
export async function confirm(
  publicClient: PublicClient,
  label: string,
  hash: Hex,
): Promise<TransactionReceipt> {
  console.log(`  ${label} tx=${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error(`${label} reverted: ${hash}`);
  return receipt;
}
