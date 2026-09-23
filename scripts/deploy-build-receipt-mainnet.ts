import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { network } from "hardhat";
import { formatEther, type Hex } from "viem";

const EXPECTED_CHAIN_ID = 677;
const EXPLORER_URL = "https://scan.botchain.ai";
const MIN_PRIORITY_FEE_PER_GAS = 20_000_000_000n;
const MAX_FEE_PER_GAS = 40_000_000_000n;
const RESERVED_BALANCE = 10_000_000_000_000_000n; // 0.01 BOT for the first receipt and a retry.

const { viem } = await network.create({
  network: "botMainnet",
  chainType: "generic",
});

const publicClient = await viem.getPublicClient();
const [deployer] = await viem.getWalletClients();
if (!deployer) throw new Error("No BOT mainnet deployer account is configured.");

const chainId = await publicClient.getChainId();
if (chainId !== EXPECTED_CHAIN_ID) {
  throw new Error(`Wrong network: expected chain ${EXPECTED_CHAIN_ID}, received ${chainId}.`);
}

const artifactUrl = new URL(
  "../artifacts/contracts/BuildReceipt.sol/BuildReceipt.json",
  import.meta.url,
);
const artifact = JSON.parse(await readFile(artifactUrl, "utf8")) as { bytecode: Hex };
const sourceUrl = new URL("../contracts/BuildReceipt.sol", import.meta.url);
const source = await readFile(sourceUrl);
const sourceSha256 = createHash("sha256").update(source).digest("hex");
const balance = await publicClient.getBalance({ address: deployer.account.address });
const estimatedGas = await publicClient.estimateGas({
  account: deployer.account.address,
  data: artifact.bytecode,
});
const maximumDeploymentCost = estimatedGas * MAX_FEE_PER_GAS;

console.log("Network: BOT Chain Mainnet");
console.log("Chain ID:", chainId);
console.log("Deployer:", deployer.account.address);
console.log("Balance:", `${formatEther(balance)} BOT`);
console.log("Estimated deployment gas:", estimatedGas.toString());
console.log("Maximum deployment cost:", `${formatEther(maximumDeploymentCost)} BOT`);
console.log("Required post-deployment reserve:", `${formatEther(RESERVED_BALANCE)} BOT`);
console.log("Contract source SHA-256:", sourceSha256);

if (balance < maximumDeploymentCost + RESERVED_BALANCE) {
  throw new Error("Insufficient balance to deploy while preserving the required BOT reserve.");
}

if (process.env.CONFIRM_BOT_MAINNET_DEPLOY !== "YES") {
  throw new Error(
    "Preflight passed. Set CONFIRM_BOT_MAINNET_DEPLOY=YES to authorize the mainnet deployment.",
  );
}

const { deploymentTransaction } = await viem.sendDeploymentTransaction(
  "BuildReceipt",
  [],
  {
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MIN_PRIORITY_FEE_PER_GAS,
  },
);

console.log("Deployment transaction:", deploymentTransaction.hash);
console.log("Transaction URL:", `${EXPLORER_URL}/tx/${deploymentTransaction.hash}`);

const receipt = await publicClient.waitForTransactionReceipt({
  hash: deploymentTransaction.hash,
});
if (!receipt.contractAddress) {
  throw new Error("The deployment transaction confirmed without a contract address.");
}

const code = await publicClient.getCode({ address: receipt.contractAddress });
if (!code || code === "0x") throw new Error("No contract bytecode found after deployment.");

const buildReceipt = await viem.getContractAt("BuildReceipt", receipt.contractAddress);
const receiptCount = await buildReceipt.read.receiptCount();
if (receiptCount !== 0n) throw new Error("New registry did not start with zero receipts.");

const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
console.log("Contract address:", receipt.contractAddress);
console.log("Contract URL:", `${EXPLORER_URL}/address/${receipt.contractAddress}`);
console.log("Deployment block:", receipt.blockNumber.toString());
console.log("Block timestamp:", new Date(Number(block.timestamp) * 1000).toISOString());
console.log("Initial receipt count:", receiptCount.toString());
