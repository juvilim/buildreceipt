import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { encodeAbiParameters, keccak256 } from "viem";

describe("BuildReceipt", async function () {
  const { viem } = await network.create();
  const [builder, otherBuilder] = await viem.getWalletClients();

  type ReceiptInput = [string, string, string, string, string];

  const receiptInput: ReceiptInput = [
    "buildreceipt",
    "1.0.0",
    "https://example.com/releases/v1.0.0",
    "a1b2c3d4e5f6",
    "Initial release",
  ];

  function contentHash(builderAddress: `0x${string}`, input: ReceiptInput = receiptInput) {
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
        [builderAddress, ...input],
      ),
    );
  }

  async function deployReceipt() {
    return viem.deployContract("BuildReceipt");
  }

  it("creates a valid receipt and emits ReceiptCreated", async function () {
    const receipt = await deployReceipt();
    const expectedHash = contentHash(builder.account.address);

    await viem.assertions.emitWithArgs(
      receipt.write.createReceipt([...receiptInput]),
      receipt,
      "ReceiptCreated",
      [1n, builder.account.address, expectedHash],
    );
  });

  it("increments receiptCount and stores the caller as builder", async function () {
    const receipt = await deployReceipt();

    await receipt.write.createReceipt([...receiptInput]);

    assert.equal(await receipt.read.receiptCount(), 1n);
    const stored = (await receipt.read.receipts([1n])) as readonly [
      `0x${string}`,
      bigint,
      `0x${string}`,
    ];
    assert.equal(stored[0].toLowerCase(), builder.account.address.toLowerCase());
  });

  it("rejects every required field when empty", async function () {
    const receipt = await deployReceipt();

    for (let index = 0; index < receiptInput.length; index++) {
      const input = [...receiptInput];
      input[index] = "";
      await viem.assertions.revertWithCustomError(
        receipt.write.createReceipt(input),
        receipt,
        "EmptyField",
      );
    }
  });

  it("rejects oversized fields", async function () {
    const receipt = await deployReceipt();
    const input = [...receiptInput];
    input[0] = "p".repeat(129);

    await viem.assertions.revertWithCustomError(
      receipt.write.createReceipt(input),
      receipt,
      "FieldTooLong",
    );
  });

  it("returns receipt IDs for a wallet", async function () {
    const receipt = await deployReceipt();

    await receipt.write.createReceipt([...receiptInput]);
    await receipt.write.createReceipt([
      "buildreceipt",
      "1.0.1",
      "https://example.com/releases/v1.0.1",
      "b1c2d3e4f5a6",
      "Patch release",
    ]);

    assert.deepEqual(await receipt.read.getReceiptIds([builder.account.address]), [1n, 2n]);
  });

  it("keeps separate receipt histories for separate wallets", async function () {
    const receipt = await deployReceipt();

    await receipt.write.createReceipt([...receiptInput]);
    await receipt.write.createReceipt([...receiptInput], { account: otherBuilder.account });

    assert.deepEqual(await receipt.read.getReceiptIds([builder.account.address]), [1n]);
    assert.deepEqual(await receipt.read.getReceiptIds([otherBuilder.account.address]), [2n]);
  });

  it("stores the expected content hash", async function () {
    const receipt = await deployReceipt();
    const expectedHash = contentHash(builder.account.address);

    await receipt.write.createReceipt([...receiptInput]);
    const stored = (await receipt.read.receipts([1n])) as readonly [
      `0x${string}`,
      bigint,
      `0x${string}`,
    ];

    assert.equal(stored[2], expectedHash);
  });

  it("does not expose a receipt update or deletion function", async function () {
    const receipt = await deployReceipt();
    await receipt.write.createReceipt([...receiptInput]);
    const initial = await receipt.read.receipts([1n]);
    const functionNames = (receipt.abi as readonly { type: string; name?: string }[])
      .filter((item) => item.type === "function")
      .map((item) => item.name);

    assert.deepEqual(functionNames.sort(), [
      "MAX_COMMIT_HASH_LENGTH",
      "MAX_NOTE_LENGTH",
      "MAX_PROJECT_LENGTH",
      "MAX_RELEASE_URL_LENGTH",
      "MAX_VERSION_LENGTH",
      "createReceipt",
      "getReceiptIds",
      "receiptCount",
      "receipts",
    ]);
    assert.deepEqual(await receipt.read.receipts([1n]), initial);
  });
});
