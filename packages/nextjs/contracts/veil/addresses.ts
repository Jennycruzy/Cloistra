import type { Address } from "viem";

/** VEIL backbone target chain. See DEPLOYMENTS.md. */
export const SEPOLIA_CHAIN_ID = 11155111 as const;

export const VEIL_ADDRESSES: Record<
  number,
  {
    engine: Address;
    token: Address;
    feed: Address;
    corridor: Address;
  }
> = {
  [SEPOLIA_CHAIN_ID]: {
    engine: "0x867f55aE8497fDA9ab4792FA9aEbbcfd7508B393",
    token: "0x01e256c9751aaECB591e0eEf8442a8F127D9bd55",
    feed: "0xf07f473D7D195b64f9d904BC95b5B8c39D01bdA5",
    corridor: "0x097Af49A096bd9f749f1C7c4F795A478237FE1D5",
  },
};

/** Block the fresh VEIL engine was deployed at — a floor for event queries. */
export const ENGINE_DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_VEIL_DEPLOY_BLOCK ?? "11209245");

/**
 * The VEIL Corridor is deployed per mandate. `NEXT_PUBLIC_CORRIDOR_ADDRESS`
 * can override the recorded Sepolia corridor for alternate deployments.
 */
export const CORRIDOR_ADDRESSES: Record<number, Address | undefined> = {
  [SEPOLIA_CHAIN_ID]:
    (process.env.NEXT_PUBLIC_CORRIDOR_ADDRESS as Address | undefined) ?? VEIL_ADDRESSES[SEPOLIA_CHAIN_ID].corridor,
};

export function veilFor(chainId: number | undefined) {
  if (chainId === undefined) return undefined;
  return VEIL_ADDRESSES[chainId];
}

export function corridorAddressFor(chainId: number | undefined): Address | undefined {
  if (chainId === undefined) return undefined;
  return CORRIDOR_ADDRESSES[chainId];
}
