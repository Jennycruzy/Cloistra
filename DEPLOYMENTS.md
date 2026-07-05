# DEPLOYMENTS.md — VEIL

> Current target order: local gate → Sepolia redeploy + verification → evidence capture → mainnet decision.

## Sepolia

Status: VEIL backbone and first Sepolia `Corridor` are deployed. Etherscan source verification is complete for the `Veil` engine, `DemoConfidentialToken`, `ConfidentialFeed`, and `Corridor`.

| Contract                | Address                                                                                                                         | Tx                                                                                                                                                                         |      Block |  Gas used |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------: | --------: |
| `Veil` engine           | [`0x867f55aE8497fDA9ab4792FA9aEbbcfd7508B393`](https://sepolia.etherscan.io/address/0x867f55aE8497fDA9ab4792FA9aEbbcfd7508B393) | [`0xd8d7d671955b916c3f726f49d9808b325a2a54e881de03f7510c273752fa78c6`](https://sepolia.etherscan.io/tx/0xd8d7d671955b916c3f726f49d9808b325a2a54e881de03f7510c273752fa78c6) | 11,209,245 |   513,140 |
| `DemoConfidentialToken` | [`0x01e256c9751aaECB591e0eEf8442a8F127D9bd55`](https://sepolia.etherscan.io/address/0x01e256c9751aaECB591e0eEf8442a8F127D9bd55) | [`0xa54a627b7d9409a6c2fb97b36fc2108b71e862393baeddb0b8056cf317f886b6`](https://sepolia.etherscan.io/tx/0xa54a627b7d9409a6c2fb97b36fc2108b71e862393baeddb0b8056cf317f886b6) | 11,209,245 | 1,644,538 |
| `ConfidentialFeed`      | [`0xf07f473D7D195b64f9d904BC95b5B8c39D01bdA5`](https://sepolia.etherscan.io/address/0xf07f473D7D195b64f9d904BC95b5B8c39D01bdA5) | [`0xb205694b1c35e4ad05027f3aa6f958ad7b552bf0ffc9e3616159cf1744f39932`](https://sepolia.etherscan.io/tx/0xb205694b1c35e4ad05027f3aa6f958ad7b552bf0ffc9e3616159cf1744f39932) | 11,209,245 | 1,696,240 |
| `Corridor`              | [`0x097Af49A096bd9f749f1C7c4F795A478237FE1D5`](https://sepolia.etherscan.io/address/0x097Af49A096bd9f749f1C7c4F795A478237FE1D5) | [`0xbfbcbae6569ca818c3e544b5b0f7f380a7213682e2ec9b8d52c4ad2fc154cb9a`](https://sepolia.etherscan.io/tx/0xbfbcbae6569ca818c3e544b5b0f7f380a7213682e2ec9b8d52c4ad2fc154cb9a) | 11,209,489 |   853,737 |

Feed publisher: `0x69eb1bAA26BffCD0fA9089aa2187F6Ca3e2A54f6`

Corridor parameters:

- Mandate id: `0xa83eb7b945e0f51f345589598b53df92d05b150ead5a60450a994c935813d14a`
- Operator: `0x69eb1bAA26BffCD0fA9089aa2187F6Ca3e2A54f6`
- Compliance officer: `0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf`
- Window: `2,592,000` seconds (`30 days`)
- Provisioning status: deployed, but not yet committed/funded/screened/ceiling-set with live encrypted Sepolia inputs.

Run before evidence capture:

```bash
pnpm veil:gate
```

## Ethereum Mainnet

Status: blocked until Zama FHEVM network support and production/legal readiness are confirmed.

Do not deploy VEIL to Ethereum mainnet just to get an address. The current contract depends on Zama FHEVM network configuration. If the target chain does not have the required FHEVM host, ACL, KMS verifier, input verifier, and relayer support, the deployment is not a functional VEIL deployment.
