# DEPLOYMENTS.md — CLOISTRA

> Current target order: local gate → Sepolia verification → evidence capture → mainnet decision.

## Sepolia

Status: CLOISTRA backbone and first Sepolia `Corridor` are deployed and verified on Etherscan.

| Contract                | Address                                                                                                                         | Tx                                                                                                                                                                         |      Block |  Gas used |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------: | --------: |
| `Cloistra` engine       | [`0xF34694B35841ceA17acc9Fb86D2b5bd3Ac276Eee`](https://sepolia.etherscan.io/address/0xF34694B35841ceA17acc9Fb86D2b5bd3Ac276Eee) | [`0x464044567c3620035d9ae942b85ff371d24e58f8d3536e8bbe4a1fab8b322127`](https://sepolia.etherscan.io/tx/0x464044567c3620035d9ae942b85ff371d24e58f8d3536e8bbe4a1fab8b322127) | 11,210,843 |   513,140 |
| `DemoConfidentialToken` | [`0x397ce46754a83f9c903c8e53AE9075Bd6D4d67a2`](https://sepolia.etherscan.io/address/0x397ce46754a83f9c903c8e53AE9075Bd6D4d67a2) | [`0xffdbe49a0f12d6de964530a6fd0bc1fdeaff95f0305f67015bd796d0a1b08fe3`](https://sepolia.etherscan.io/tx/0xffdbe49a0f12d6de964530a6fd0bc1fdeaff95f0305f67015bd796d0a1b08fe3) | 11,210,843 | 1,696,240 |
| `ConfidentialFeed`      | [`0xe9f2C4c32D80bc8Bed243Da4D05bE90b478777A6`](https://sepolia.etherscan.io/address/0xe9f2C4c32D80bc8Bed243Da4D05bE90b478777A6) | [`0xffa8c032ecf4d2b9cd4197144a32b75695af32462955a92ba088acef6c48d3d1`](https://sepolia.etherscan.io/tx/0xffa8c032ecf4d2b9cd4197144a32b75695af32462955a92ba088acef6c48d3d1) | 11,210,843 | 1,644,598 |
| `Corridor`              | [`0x4A3c965edb96f74451fe5921686e44CbFF4a8A7b`](https://sepolia.etherscan.io/address/0x4A3c965edb96f74451fe5921686e44CbFF4a8A7b) | [`0x351b8a0c7721cf462ec9f2d13ef2b2c676113386592fe447e8022532027fe359`](https://sepolia.etherscan.io/tx/0x351b8a0c7721cf462ec9f2d13ef2b2c676113386592fe447e8022532027fe359) | 11,210,851 |   853,737 |

Feed publisher: `0x69eb1bAA26BffCD0fA9089aa2187F6Ca3e2A54f6`

Corridor parameters:

- Mandate id: `0x3d22c2c7a148f039136b47757e1eb1f365e6506be096709b10249e9c286967b0`
- Operator: `0x69eb1bAA26BffCD0fA9089aa2187F6Ca3e2A54f6`
- Compliance officer: `0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf`
- Window: `2,592,000` seconds (`30 days`)
- Provisioning status: deployed, verified, ready for encrypted mandate commit/funding/screening/ceiling setup.

Fresh deployment flow:

```bash
pnpm deploy:sepolia
forge script packages/foundry/script/DeployCorridor.s.sol:DeployCorridor --rpc-url "$SEPOLIA_RPC_URL" --broadcast
```

Run before evidence capture:

```bash
pnpm cloistra:gate
```

## Ethereum Mainnet

Status: blocked until Zama FHEVM network support and production/legal readiness are confirmed.

Do not deploy CLOISTRA to Ethereum mainnet just to get an address. The current contract depends on Zama FHEVM network configuration. If the target chain does not have the required FHEVM host, ACL, KMS verifier, input verifier, and relayer support, the deployment is not a functional CLOISTRA deployment.
