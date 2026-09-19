import { network } from "hardhat";

const MIN_PRIORITY_FEE_PER_GAS = 20_000_000_000n;
const MAX_FEE_PER_GAS = 40_000_000_000n;

const { viem } = await network.create({
  network: "botTestnet",
  chainType: "generic",
});

const buildReceipt = await viem.deployContract(
  "BuildReceipt",
  [],
  {
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MIN_PRIORITY_FEE_PER_GAS,
  },
);

console.log("Contract address:", buildReceipt.address);
console.log("BOTScan URL:", `https://scan.bohr.life/address/${buildReceipt.address}`);
