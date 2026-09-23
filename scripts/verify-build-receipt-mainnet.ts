import assert from "node:assert/strict";

import { network } from "hardhat";
import {
  encodeAbiParameters,
  formatEther,
  keccak256,
  parseEventLogs,
  type Address,
} from "viem";

const EXPECTED_CHAIN_ID = 677;
const CONTRACT_ADDRESS = "0x6c788cbc498795c0e3247d843431adbd844f73b9";
const EXPLORER_URL = "https://scan.botchain.ai";
const MAX_PRIORITY_FEE_PER_GAS = 20_000_000_000n;
const MAX_FEE_PER_GAS = 40_000_000_000n;
const RESERVED_BALANCE = 10_000_000_000_000_000n; // Keep 0.01 BOT after validation.

type ReceiptInput = [string, string, string, string, string];

const receiptInput: ReceiptInput = [
  "BuildReceipt",
  "1.0.0-mainnet",
  "https://github.com/juvilim/buildreceipt/commit/5498d6ba2db1144c42cd26006a85fc1bf4f050ad",
  "5498d6ba2db1144c42cd26006a85fc1bf4f050ad",
  "First mainnet BuildReceipt, proving the production registry deployment.",
];

function calculateContentHash(builder: Address) {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "address" },
        { type: "string" },
        { type: "string" },
        { type: "string" },
        { type: "string" },
        { type: "string" },
      ],
      [builder, ...receiptInput],
    ),
  );
}

const { viem } = await network.create({
  network: "botMainnet",
  chainType: "generic",
});

const publicClient = await viem.getPublicClient();
const [deployer] = await viem.getWalletClients();
if (!deployer) throw new Error("No BOT mainnet deployer account is configured.");

const chainId = await publicClient.getChainId();
assert.equal(chainId, EXPECTED_CHAIN_ID, "Connected to the wrong chain.");

const code = await publicClient.getCode({ address: CONTRACT_ADDRESS });
assert.ok(code && code !== "0x", "No contract bytecode exists at the mainnet address.");

const buildReceipt = await viem.getContractAt("BuildReceipt", CONTRACT_ADDRESS);
const receiptCountBefore = await buildReceipt.read.receiptCount();
assert.equal(
  receiptCountBefore,
  0n,
  "The mainnet registry is no longer empty; refusing to create a duplicate first receipt.",
);

const expectedReceiptId = receiptCountBefore + 1n;
const expectedContentHash = calculateContentHash(deployer.account.address);
const balanceBefore = await publicClient.getBalance({ address: deployer.account.address });

await buildReceipt.simulate.createReceipt(receiptInput, { account: deployer.account.address });
const estimatedGas = await publicClient.estimateContractGas({
  address: CONTRACT_ADDRESS,
  abi: buildReceipt.abi,
  functionName: "createReceipt",
  args: receiptInput,
  account: deployer.account.address,
});
const maximumTransactionCost = estimatedGas * MAX_FEE_PER_GAS;

console.log("Network: BOT Chain Mainnet");
console.log("Chain ID:", chainId);
console.log("Contract:", CONTRACT_ADDRESS);
console.log("Builder:", deployer.account.address);
console.log("Balance:", `${formatEther(balanceBefore)} BOT`);
console.log("Receipt count before:", receiptCountBefore.toString());
console.log("Expected receipt ID:", expectedReceiptId.toString());
console.log("Expected content hash:", expectedContentHash);
console.log("Estimated gas:", estimatedGas.toString());
console.log("Maximum transaction cost:", `${formatEther(maximumTransactionCost)} BOT`);
console.log("Required post-transaction reserve:", `${formatEther(RESERVED_BALANCE)} BOT`);
console.log("Receipt fields:", receiptInput);

if (balanceBefore < maximumTransactionCost + RESERVED_BALANCE) {
  throw new Error("Insufficient balance to validate while preserving the required BOT reserve.");
}

if (process.env.CONFIRM_BOT_MAINNET_RECEIPT !== "YES") {
  throw new Error(
    "Preflight passed. Set CONFIRM_BOT_MAINNET_RECEIPT=YES to create the first mainnet receipt.",
  );
}

const transactionHash = await buildReceipt.write.createReceipt(receiptInput, {
  account: deployer.account,
  maxFeePerGas: MAX_FEE_PER_GAS,
  maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
});
console.log("Receipt transaction:", transactionHash);
console.log("Transaction URL:", `${EXPLORER_URL}/tx/${transactionHash}`);

const transactionReceipt = await publicClient.waitForTransactionReceipt({
  hash: transactionHash,
});
assert.equal(transactionReceipt.status, "success", "Receipt transaction reverted.");

const receiptCountAfter = await buildReceipt.read.receiptCount();
assert.equal(receiptCountAfter, expectedReceiptId, "receiptCount did not increment exactly once.");

const stored = await buildReceipt.read.receipts([expectedReceiptId]);
assert.equal(stored[0].toLowerCase(), deployer.account.address.toLowerCase(), "Builder mismatch.");
assert.ok(stored[1] > 0n, "Stored creation timestamp is missing.");
assert.equal(stored[2], expectedContentHash, "Content hash mismatch.");
assert.deepEqual(stored.slice(3), receiptInput, "Stored release fields do not match the input.");

const builderReceiptIds = await buildReceipt.read.getReceiptIds([deployer.account.address]);
assert.ok(builderReceiptIds.includes(expectedReceiptId), "Builder history is missing the new receipt.");

const events = parseEventLogs({
  abi: buildReceipt.abi,
  logs: transactionReceipt.logs,
  eventName: "ReceiptCreated",
});
assert.equal(events.length, 1, "Expected exactly one ReceiptCreated event.");
assert.equal(events[0].args.receiptId, expectedReceiptId, "Event receipt ID mismatch.");
assert.equal(
  events[0].args.builder.toLowerCase(),
  deployer.account.address.toLowerCase(),
  "Event builder mismatch.",
);
assert.equal(events[0].args.contentHash, expectedContentHash, "Event content hash mismatch.");

const block = await publicClient.getBlock({ blockNumber: transactionReceipt.blockNumber });
assert.equal(stored[1], block.timestamp, "Stored timestamp does not match the receipt block.");

const balanceAfter = await publicClient.getBalance({ address: deployer.account.address });
assert.ok(balanceAfter >= RESERVED_BALANCE, "Post-validation BOT reserve is below 0.01 BOT.");

console.log("Receipt count after:", receiptCountAfter.toString());
console.log("Receipt block:", transactionReceipt.blockNumber.toString());
console.log("Receipt timestamp:", new Date(Number(block.timestamp) * 1000).toISOString());
console.log("Gas used:", transactionReceipt.gasUsed.toString());
console.log("Balance after:", `${formatEther(balanceAfter)} BOT`);
console.log("Stored receipt:", stored);
console.log("Builder receipt IDs:", builderReceiptIds.map(String));
console.log("MAINNET RECEIPT VALIDATION PASSED");
