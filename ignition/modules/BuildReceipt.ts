import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BuildReceiptModule", (m) => {
  const buildReceipt = m.contract("BuildReceipt");

  return { buildReceipt };
});
