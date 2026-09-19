import { network } from "hardhat";

const CONTRACT_ADDRESS = "0x6c788cbc498795c0e3247d843431adbd844f73b9";
const MAX_PRIORITY_FEE_PER_GAS = 20_000_000_000n;
const MAX_FEE_PER_GAS = 40_000_000_000n;

const { viem } = await network.create({
  network: "botTestnet",
  chainType: "generic",
});

const publicClient = await viem.getPublicClient();
const [deployer] = await viem.getWalletClients();
const buildReceipt = await viem.getContractAt("BuildReceipt", CONTRACT_ADDRESS);

console.log("receiptCount before:", (await buildReceipt.read.receiptCount()).toString());

const transactionHash = await buildReceipt.write.createReceipt(
  [
    "BuildReceipt",
    "0.1.0-testnet",
    `https://scan.bohr.life/address/${CONTRACT_ADDRESS}`,
    "testnet-deployment",
    "Gate 3 verification receipt",
  ],
  {
    account: deployer.account,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  },
);

await publicClient.waitForTransactionReceipt({ hash: transactionHash });

console.log("Receipt transaction:", transactionHash);
console.log("receiptCount after:", (await buildReceipt.read.receiptCount()).toString());
console.log("receipts(1):", await buildReceipt.read.receipts([1n]));
console.log(
  "getReceiptIds(deployer):",
  await buildReceipt.read.getReceiptIds([deployer.account.address]),
);
