import { getAddress, type Address, type Hex } from "viem";

/** Read a required private key from the environment (0x-prefixed). */
export function requireKey(name: string): Hex {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing required env ${name}`);
  return (v.startsWith("0x") ? v : `0x${v}`) as Hex;
}

/** Parse a required positive integer amount argument. */
export function requireAmount(arg: string | undefined, usage: string): bigint {
  if (!arg) throw new Error(`Usage: ${usage}`);
  const amount = BigInt(arg);
  if (amount <= 0n) throw new Error("amount must be a positive integer");
  return amount;
}

/** Parse an optional checksummed address argument. */
export function optionalAddress(arg: string | undefined): Address | undefined {
  return arg ? getAddress(arg) : undefined;
}
