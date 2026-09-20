# BuildReceipt manual browser tests

Use these tests after the automated contract and frontend checks pass.

## Before testing

- Run `npm run dev` from `web/` and open the URL printed by Vite.
- Use a browser with MetaMask installed and unlocked.
- Select the dedicated user-testing account, not the deployment account.
- Make sure the user-testing account has a small BOT Chain Testnet balance.
- Keep the [BuildReceipt contract on BOTScan](https://scan.bohr.life/address/0x6c788cbc498795c0e3247d843431adbd844f73b9) available for verification.
- Never enter or paste a private key into the frontend.

Only tests marked **on-chain** spend test BOT.

## Connection tests

### M-01 — Approve a wallet connection

1. Disconnect BuildReceipt from MetaMask if it is already connected.
2. Refresh the page.
3. Click **Connect wallet**.
4. Select the user-testing account and approve the connection.

Expected:

- The connecting notice appears while MetaMask is waiting.
- The shortened user-testing address replaces **Connect wallet**.
- The status becomes `READY` on BOT Chain Testnet, or `WRONG_NETWORK` on another network.
- No transaction is sent and no BOT is spent.

### M-02 — Close the MetaMask sidebar while connecting

1. Disconnect the site and refresh it.
2. Click **Connect wallet**.
3. Close the MetaMask sidebar without approving or rejecting the request.

Expected:

- The top notice remains visible with **Action required in MetaMask**.
- The header action reads **MetaMask pending** and is disabled.
- The notice explains how to reopen MetaMask from the browser toolbar.
- Reopen MetaMask manually and approve or reject the waiting request.

### M-03 — Reject a connection

1. Disconnect the site and refresh it.
2. Click **Connect wallet**.
3. Click **Cancel** in MetaMask.

Expected:

- A top notification says **Wallet action failed**.
- The message says the connection request was rejected in MetaMask.
- The detailed transaction status also shows `ERROR`.
- The local receipt draft is not cleared.
- **Connect wallet** becomes available again.

### M-04 — Add or switch to BOT Chain Testnet

1. Connect MetaMask while another network is selected.
2. Click **Switch network**.
3. Approve adding BOT Chain Testnet if MetaMask does not already have it.
4. Approve the network switch.

Expected:

- MetaMask shows chain ID `968` and currency `BOT`.
- BuildReceipt shows `BOT Testnet` and status `READY`.
- Rejecting either wallet prompt shows an error without losing the draft.

## Receipt tests

### M-05 — Reject receipt creation

1. Connect the user-testing wallet on BOT Chain Testnet.
2. Complete all five receipt fields with valid values.
3. Click **Create on-chain receipt**.
4. Reject the transaction in MetaMask.

Expected:

- No receipt is created and no test BOT is spent.
- The failure notification appears near the header.
- The draft remains available for another attempt.

### M-06 — Create a valid receipt (**on-chain**)

1. Record the current number of receipts shown for the connected wallet.
2. Complete all five fields with a unique version and note.
3. Click **Create on-chain receipt**.
4. Confirm the transaction in MetaMask.
5. Wait for `TX_STATUS: CONFIRMED`.

Expected:

- The UI moves through wallet approval and confirmation states.
- A BOTScan transaction link appears after submission.
- The receipt preview shows the chain-assigned ID, builder, timestamp, and content hash.
- The connected wallet history increases by one receipt.
- The new history entry is marked **Verified**.

Record the receipt ID and transaction hash in the test notes.

### M-07 — Verify persistence and history

1. Refresh the page after M-06 confirms.
2. Reconnect the same user-testing wallet if necessary.
3. Scroll to **Receipts you can point to**.
4. Select **View receipt** on the new record.

Expected:

- The receipt is loaded directly from BOT Chain Testnet after refresh.
- Selecting it scrolls to the workspace and displays it in the receipt preview.
- Its project, version, URL, commit, note, builder, timestamp, and content hash match the submitted receipt.

### M-08 — Validate required fields and length limits

1. Leave one required field empty and attempt to create a receipt.
2. Repeat for each required field.
3. Paste text longer than the displayed field limit into each field.

Expected:

- An incomplete draft is rejected before MetaMask opens.
- The error identifies the invalid field.
- Inputs do not accept more than their displayed maximum length.
- No transaction is sent.

### M-09 — Keep wallet histories separate

1. Note the receipt IDs shown for the user-testing account.
2. Switch MetaMask to a different account.
3. Approve the connection if prompted.

Expected:

- The address in the header changes.
- History reloads for the newly selected account.
- Receipts belonging to the first account are not displayed for the second account.

## Explorer verification

### M-10 — Confirm the receipt on BOTScan

1. Open the transaction link produced by M-06.
2. Confirm the transaction status is successful.
3. Confirm the destination is the BuildReceipt contract.
4. Inspect the logs for the `ReceiptCreated` event.

Expected:

- The event contains the same receipt ID, builder address, and content hash shown by BuildReceipt.
- No private key or secret appears in the transaction, logs, or URL.

## Test record

| Case | Result | Notes / transaction hash |
| --- | --- | --- |
| M-01 | ☐ Pass ☐ Fail | |
| M-02 | ☐ Pass ☐ Fail | |
| M-03 | ☐ Pass ☐ Fail | |
| M-04 | ☐ Pass ☐ Fail | |
| M-05 | ☐ Pass ☐ Fail | |
| M-06 | ☐ Pass ☐ Fail | |
| M-07 | ☐ Pass ☐ Fail | |
| M-08 | ☐ Pass ☐ Fail | |
| M-09 | ☐ Pass ☐ Fail | |
| M-10 | ☐ Pass ☐ Fail | |
