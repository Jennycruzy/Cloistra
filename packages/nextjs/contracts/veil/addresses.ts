import type { Address } from "viem";

/** VEIL backbone target chain. See DEPLOYMENTS.md. */
export const SEPOLIA_CHAIN_ID = 11155111 as const;

export const VEIL_ADDRESSES: Record<
  number,
  {
    engine: Address;
    token: Address;
    feed: Address;
  }
> = {
  [SEPOLIA_CHAIN_ID]: {
    engine: "0x867f55aE8497fDA9ab4792FA9aEbbcfd7508B393",
    token: "0x01e256c9751aaECB591e0eEf8442a8F127D9bd55",
    feed: "0xf07f473D7D195b64f9d904BC95b5B8c39D01bdA5",
  },
};

/** Block the fresh VEIL engine was deployed at — a floor for event queries. */
export const ENGINE_DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_VEIL_DEPLOY_BLOCK ?? "11209245");

/**
 * The VEIL Corridor is deployed per-mandate. Until a fresh VEIL corridor is
 * deployed, this stays undefined and the UI reads the operator's selected
 * corridor from `NEXT_PUBLIC_CORRIDOR_ADDRESS` or the in-app corridor picker.
 * No address is hardcoded to fake a deployment.
 */
export const CORRIDOR_ADDRESSES: Record<number, Address | undefined> = {
  [SEPOLIA_CHAIN_ID]: (process.env.NEXT_PUBLIC_CORRIDOR_ADDRESS as Address | undefined) ?? undefined,
};

export function veilFor(chainId: number | undefined) {
  if (chainId === undefined) return undefined;
  return VEIL_ADDRESSES[chainId];
}

export function corridorAddressFor(chainId: number | undefined): Address | undefined {
  if (chainId === undefined) return undefined;
  return CORRIDOR_ADDRESSES[chainId];
}
