# VEIL / VEIL Contracts

This package contains the Solidity side of VEIL. `Veil.sol` is the sealed-mandate engine; `orders/Corridor.sol`
is the VEIL product contract that turns the engine into a sealed compliance corridor.

## Contract Map

```text
src/
├── Veil.sol                     # sealed-mandate engine
├── orders/Corridor.sol               # VEIL corridor + sealed velocity accumulator
├── orders/Leash.sol                  # Order I composability proof
├── orders/SealedSettlement.sol       # Order II cross-contract proof
├── orders/ConfidentialFeed.sol       # independent sealed feed for Order II
└── mocks/DemoConfidentialToken.sol   # ERC-7984 demo token
```

## Verify Locally

```bash
forge build
forge test -vv
```

The local suite runs on `forge-fhevm`'s cleartext harness. Real FHE relayer/KMS behavior is Sepolia-only; record
those transaction hashes in `../../DEPLOYMENTS.md`.

## Deploy Backbone

From the repo root:

```bash
scripts/deploy-veil-sepolia.sh
```

That deploys the shared VEIL backbone for VEIL: engine, demo confidential token, and `ConfidentialFeed`.
The VEIL `Corridor` is deployed per mandate after the operator encrypts the policy inputs.
