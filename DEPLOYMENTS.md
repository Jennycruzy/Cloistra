# DEPLOYMENTS.md — VEIL / INDENTURE on Sepolia

> **Status: INDENTURE backbone LIVE on Sepolia (2026-07-01); VEIL Corridor Sepolia flow pending.** The
> consumer-agnostic engine, demo cToken, and feed are deployed and verified on-chain — real deploy tx hashes
> below. The encrypted VEIL corridor flows (commit/fund/screen/ceiling/transfer + officer decrypt) still need
> a funded deployer and real relayer/KMS transactions. The 42/42 forge-fhevm tests are the local **cleartext
> harness** — not the real coprocessor; only the on-chain tx hashes below are real-Sepolia evidence.

Network: **Sepolia** (chainId `11155111`). FHEVM host addresses are selected by `ZamaEthereumConfig`
— none are hardcoded (see `VERIFICATION.md §2`). Deployer/feed-publisher:
`0x69eb1bAA26BffCD0fA9089aa2187F6Ca3e2A54f6` (burner).

## Backbone — LIVE

| Contract                       | Address                                                                                                                         | Deploy tx                                                                                                                     | Block      | Gas       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- | --------- |
| `Indenture` (sealed engine)    | [`0x58eba10730Fd1ee4E5b24AaAa7caE154cbC69C83`](https://sepolia.etherscan.io/address/0x58eba10730Fd1ee4E5b24AaAa7caE154cbC69C83) | [`0xd1e36e90…1de2ecff`](https://sepolia.etherscan.io/tx/0xd1e36e904114863233678748bf3e16253060f946d01e7e56aad5a1701de2ecff)   | 11,179,602 | 1,606,847 |
| `DemoConfidentialToken` (iUSD) | [`0x366544F805e10e7320779d138Cca57FA0E4c5cdf`](https://sepolia.etherscan.io/address/0x366544F805e10e7320779d138Cca57FA0E4c5cdf) | [`0xc02bf976…f25bc5f757`](https://sepolia.etherscan.io/tx/0xc02bf97653a849331c8e985633b66146ccbfa3ee2d89d2e1c3bef3f25bc5f757) | 11,179,774 | 1,886,569 |
| `ConfidentialFeed`             | [`0x83Ee9a4d2A3f0851DDD022A114663524694571C4`](https://sepolia.etherscan.io/address/0x83Ee9a4d2A3f0851DDD022A114663524694571C4) | [`0xbd9d34ec…307dcfb74b`](https://sepolia.etherscan.io/tx/0xbd9d34ecce8cb659c3a9ce1894373a7dd0235d2f8f7552a68da1aa307dcfb74b) | 11,179,777 | 604,026   |

All three verified live: engine returns `mandateExists(0)=false`, token reports `name()="Indenture USD"`
/ `symbol()="iUSD"`, feed reports `publisher()=`the deployer / `hasValue()=false`.

## Per-mandate consumers (deployed per demo flow)

| Contract           | Order    | Address | Deploy tx |
| ------------------ | -------- | ------- | --------- |
| `Corridor` (VEIL)  | product  | `TBD`   | `TBD`     |
| `Leash`            | proof I  | `TBD`   | `TBD`     |
| `SealedSettlement` | proof II | `TBD`   | `TBD`     |

## Evidence — live tx hashes (Evidence Gates 0/2/3)

Fill each row with a real Sepolia tx hash. Rejection paths must be real on-chain outcomes, not
frontend guards.

### Evidence Gate 0 — pipeline proof (trivial FHECounter)

- Encrypted write: `TBD`
- Browser user-decryption (EIP-712 prompt visible): `TBD` (screenshot)

### Composability proof — Order I / Leash (Evidence Gate 2)

- Commit mandate: `TBD`
- Fund custody: `TBD`
- Compliant settlement (seal-fuse): `TBD`
- Oversize move → nullified to 0: `TBD`
- Off-allowlist payee → nullified: `TBD`
- Replay → reverts on nonce: `TBD`
- Forged ciphertext → reverts at input verification: `TBD`
- Principal decrypt (audit): `TBD`

### Composability proof — Order II / SealedSettlement (Evidence Gate 3)

- Feed posts sealed value: `TBD`
- Exercise in-the-money → payout: `TBD`
- Exercise out-of-the-money → 0: `TBD`
- (Strike remains sealed after settlement — proven by test; asserted on-chain via ACL.)

### VEIL Corridor — velocity accumulator (Evidence Gate C)

> **Status: proven on the cleartext harness (14/14 `Corridor.t.sol`); real Sepolia hashes pending.**
> Every bullet below must be a REAL Sepolia tx — each rejection a real on-chain outcome (the engine
> nullifies to zero), NOT a frontend guard. **Blocked on a funded `DEPLOYER_PRIVATE_KEY` + `SEPOLIA_RPC_URL`.**
> The audit decrypt must be a real EIP-712 user-decryption by the compliance-officer address, never hardcoded.

- Deploy `Corridor` (operator-sealed policy: cap + screening + ceiling): `TBD`
- Commit mandate with a DISTINCT compliance officer (`commitMandateFor`): `TBD`
- Fund custody + screen recipient + set sealed ceiling: `TBD`
- Compliant transfer → funds move (gate-clear): `TBD`
- Over-cap transfer → nullified to 0 (sealed state unchanged): `TBD`
- Screened-out recipient → nullified: `TBD`
- Velocity-breach transfer (after filling the window) → nullified: `TBD`
- Window-rollover transfer → succeeds after the public window advances: `TBD`
- Compliance-officer EIP-712 user-decryption of one flagged transfer (audit): `TBD`
- Proof the sender/operator address CANNOT decrypt the policy handles: `TBD` (ACL / failed user-decrypt)

### Off-ramp edge — sandbox payout (Evidence Gate C2)

> Flutterwave v3 sandbox key wired (Nigeria / NGN). The listener fires a REAL sandbox payout on a genuine
> on-chain "transfer cleared" event; key server-side only (gitignored `.env.local`); labeled SANDBOX.
> Remaining block: a funded sandbox test balance **and** a deployed Corridor (Phase C) to emit a real clear.

- Provider + sandbox endpoint/auth recorded in `VERIFICATION.md §6e`: ✅ Flutterwave v3 · `POST /v3/transfers` · static `Bearer FLWSECK_TEST` · key read-verified (`GET /v3/transfers` → 200, `GET /v3/banks/NG` → success)
- **Full loop exercised end-to-end** (`packages/offramp/scripts/prove-loop.ts`, same `processSettlement` gate the live listener uses):
  - On-chain half: Corridor harness happy path deploys a Corridor + commits + funds + screens + sets the sealed ceiling + settles → **cleared `moved = 80`** (gas 4.86M; `forge test test_compliantTransfer_clears`).
  - Off-ramp half: `moved = 80 > 0` → gate opens → **real authenticated `POST /v3/transfers`** to Flutterwave (NGN, test account `0690000032`/`044`).
  - Flutterwave response: `400 {"status":"error","message":"Please enable IP Whitelisting to access this service"}` — the request **reached the transfer handler**; the only block is an **account-side control**.
- Remaining for a real reference id (all account/funding, not code):
  1. Enable **IP whitelisting** in the Flutterwave dashboard and whitelist the listener's server IP (this run's egress was `172.166.156.96`).
  2. **Fund the sandbox test balance** (NGN debit wallet).
  3. For the **live KMS decrypt** (`RelayerNode`) instead of a stubbed `moved`: deploy the updated engine + a Corridor to Sepolia and top up the deployer beyond ~1 FHE tx — at 2.57 gwei the current 0.0426 ETH covers the deploys but not the ~6-tx FHE loop.
- Captured run: real Sepolia clear event → real sandbox payout call + provider reference id: `TBD` (unblocks after 1–3 above)

## Performance honesty (Phase 6)

Record real per-settlement latency + homomorphic-compute cost on Sepolia for each Order once
deployed; note any predicate near the per-tx block-gas limit (`16_777_216`).

| Order | Path                        | Gas (Sepolia) | Latency |
| ----- | --------------------------- | ------------- | ------- |
| I     | `Leash.execute`             | `TBD`         | `TBD`   |
| II    | `SealedSettlement.exercise` | `TBD`         | `TBD`   |
