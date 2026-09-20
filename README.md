<p align="center">
  <img src="docs/assets/buildreceipt-banner.png" alt="BuildReceipt — Proof that you shipped" width="100%" />
</p>

<p align="center">
  An append-only, on-chain release receipt registry for software shipped on BOT Chain.
</p>

<p align="center">
  <a href="https://scan.bohr.life/address/0x6c788cbc498795c0e3247d843431adbd844f73b9">Testnet contract</a>
  ·
  <a href="https://scan.bohr.life/tx/0x0497d952772dd1c64d1479d5560c35d17ef7a0cff70bcef7ccc6923dea051e2c">First receipt</a>
</p>

## What is BuildReceipt?

BuildReceipt turns a software release into a permanent record signed by its builder. Each receipt stores the project, version, release URL, commit hash, release note, builder wallet, block timestamp, and a deterministic content hash.

The registry is deliberately small and immutable:

- Receipt IDs begin at `1` and increase sequentially.
- The caller becomes the recorded builder.
- The chain supplies the receipt timestamp.
- Required fields cannot be empty and every field has a length limit.
- The content hash covers the builder and every release field.
- There are no update, delete, administrator, payment, withdrawal, token, NFT, or upgrade functions.

## BOT Chain testnet deployment

| Item | Value |
| --- | --- |
| Network | BOT Chain Testnet |
| Chain ID | `968` |
| Contract | [`0x6c788cbc498795c0e3247d843431adbd844f73b9`](https://scan.bohr.life/address/0x6c788cbc498795c0e3247d843431adbd844f73b9) |
| Deployment transaction | [`0x2fa5…11c09`](https://scan.bohr.life/tx/0x2fa5b077b42320b45fb2146a6823395ec9384a1fcefc263c2b5d68bafd911c09) |
| Deployment block | [`23979069`](https://scan.bohr.life/block/23979069) |
| First testnet receipt | [`0x0497…51e2c`](https://scan.bohr.life/tx/0x0497d952772dd1c64d1479d5560c35d17ef7a0cff70bcef7ccc6923dea051e2c) |
| Solidity | `0.8.34` |
| Deployment date | 20 September 2026 |

The machine-readable deployment record is in [`deployments/bot-testnet.json`](deployments/bot-testnet.json).

## Project structure

```text
contracts/        BuildReceipt contract and Solidity tests
test/             TypeScript integration tests
ignition/         Hardhat Ignition deployment module and deployment record
scripts/          Deployment and testnet verification scripts
deployments/      Safe public network metadata
web/              React and Vite frontend
```

## Local development

### Requirements

- Node.js 22 or newer
- npm
- MetaMask for browser testing

Clone the repository and install the contract dependencies:

```bash
git clone <repository-url>
cd buildreceipt
npm install
```

Compile and run all contract tests:

```bash
npx hardhat compile
npx hardhat test
```

Run the frontend locally:

```bash
cd web
npm install
npm run dev
```

The frontend connects to MetaMask, adds or switches to BOT Chain Testnet, creates receipts through the deployed contract, and loads the connected wallet's receipt history.

Before publishing a frontend release, complete the [manual browser test checklist](docs/MANUAL_TESTING.md). The checklist includes wallet approval and rejection, an accidentally closed MetaMask sidebar, network switching, a real testnet receipt, history persistence, wallet separation, and BOTScan verification.

## BOT Chain Testnet

Add the network to MetaMask with these values:

| Setting | Value |
| --- | --- |
| Network name | BOT Chain Testnet |
| RPC URL | `https://rpc.bohr.life` |
| Chain ID | `968` |
| Currency symbol | `BOT` |
| Block explorer | `https://scan.bohr.life` |

Test BOT is available from the [official faucet](https://faucet.botchain.ai/en/basic).

## Deployment key safety

Use a dedicated deployment wallet. Never put its private key in the frontend, a committed environment file, screenshots, GitHub Actions logs, or source code.

Store the key in Hardhat's encrypted local keystore:

```bash
npx hardhat keystore set BOT_DEPLOYER_PRIVATE_KEY
```

The repository ignores `.env` files, but the encrypted Hardhat keystore is preferred for local deployment.

## Deploying

The Ignition module is available at `ignition/modules/BuildReceipt.ts`. BOT Chain currently requires a non-zero priority fee; the standalone deployment script includes the explicit EIP-1559 fee values used for the testnet deployment:

```bash
npx hardhat run scripts/deploy-build-receipt.ts
```

After deployment, update the public deployment metadata and verify the contract reads and write flow with a freshly configured script. The existing verification script points to the published testnet contract and creates a real receipt, so running it spends test BOT:

```bash
npx hardhat run scripts/verify-build-receipt-testnet.ts
```

## Contract interface

```solidity
function createReceipt(
    string calldata project,
    string calldata version,
    string calldata releaseUrl,
    string calldata commitHash,
    string calldata note
) external returns (uint256 receiptId);

function getReceiptIds(address builder)
    external
    view
    returns (uint256[] memory);
```

Public reads are also available through `receiptCount()` and `receipts(receiptId)`.

## Status

- [x] Immutable receipt contract
- [x] Contract test suite
- [x] BOT Chain testnet deployment
- [x] First on-chain testnet receipt
- [x] Responsive frontend shell
- [x] MetaMask and live Web3 integration
- [ ] Manual browser transaction gate
- [ ] Shareable receipt verification pages
- [ ] BOT Chain mainnet deployment

## License

The smart contract declares SPDX license identifier `MIT`. A repository-level license file will be added before the first public release.
