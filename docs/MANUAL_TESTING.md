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
- On BOT Chain Testnet, the status becomes `DRAFT_INCOMPLETE` until all five release fields are valid; on another network it becomes `WRONG_NETWORK`.
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
- BuildReceipt shows `BOT Testnet`; transaction status remains `DRAFT_INCOMPLETE` until all five fields are valid.
- Rejecting either wallet prompt shows an error without losing the draft.

## Receipt tests

### M-05 — Reject receipt creation, then retry

1. Connect the user-testing wallet on BOT Chain Testnet.
2. Complete all five receipt fields with the release values you intend to record.
3. Copy the five values into the test notes so you can compare them after rejection.
4. Click **Create on-chain receipt**.
5. Reject the transaction in MetaMask.
6. Confirm that all five fields still contain exactly the same values.
7. Confirm that no new receipt appears in history and no transaction hash is shown.
8. Click **Create on-chain receipt** again without re-entering the fields.
9. This time, approve the transaction in MetaMask.
10. Wait for `TX_STATUS: CONFIRMED`.

Expected:

- The rejected attempt creates no receipt and spends no test BOT.
- The rejection notification appears near the header and identifies the canceled wallet action.
- The complete draft remains available unchanged for the retry.
- The retry progresses through wallet approval and chain confirmation exactly once.
- After confirmation, the confirmed receipt stays visible while all five composer fields reset.
- Refreshing the page does not restore the confirmed draft values from `localStorage`.

### M-06 — Verify the successfully retried receipt (**on-chain**)

The successful retry from M-05 fulfills this case. Do not create a second receipt.

1. Record the confirmed receipt ID and transaction hash from M-05.
2. Confirm that wallet history increased by exactly one receipt compared with its count before M-05.
3. Compare the confirmed receipt with the five values recorded before rejection.

Expected:

- Only the approved retry produced an on-chain transaction.
- A BOTScan transaction link appears for that transaction.
- The receipt preview shows the chain-assigned ID, builder, timestamp, and content hash.
- Every stored release field matches the preserved draft that was retried.
- The new history entry is marked **Verified**.

Record the receipt ID and transaction hash in the test notes.

### M-07 — Verify persistence and history

1. Refresh the page after M-06 confirms.
2. Reconnect the same user-testing wallet if necessary.
3. Scroll to **Receipts you can point to**.
4. Select **Quick view** on the new record.
5. Close the dialog, then select **View proof**.

Expected:

- The receipt is loaded directly from BOT Chain Testnet after refresh.
- **Quick view** opens a focused receipt dialog without replacing the composer preview.
- Its project, version, URL, commit, note, builder, timestamp, and content hash match the submitted receipt.
- Escape, the close button, and clicking the backdrop close the dialog and return focus to the history action.
- **View proof** opens the standalone `?receipt=<id>` verification page without requiring a wallet connection.

### M-08 — Validate required fields and length limits

1. Leave one required field empty and attempt to create a receipt.
2. Repeat for each required field.
3. Fill all five fields, but enter `not-a-url` as the release URL.
4. Paste text longer than the displayed field limit into each field.

Expected:

- **Complete release details** remains disabled until all five fields are valid.
- When five fields are present but the URL is invalid, the action reads **Fix invalid release details**, the URL field is highlighted, and the exact URL requirement appears beside the action and in transaction status.
- A complete draft changes the action to **Connect wallet to sign** or **Create on-chain receipt**, depending on wallet state.
- A connected wallet shows `TX_STATUS: DRAFT_INCOMPLETE` until the draft is valid, then `TX_STATUS: READY_TO_SIGN`.
- Inputs do not accept more than their displayed maximum length.
- No transaction is sent.

### M-09 — Keep wallet histories separate

1. Note the receipt IDs shown for the user-testing account.
2. Click the connected address in the header, which is labeled **Switch**.
3. Choose a different account in MetaMask and approve it.

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

### M-11 — Open and copy a public proof link

1. Select a verified receipt from wallet history.
2. Click **Copy proof link**.
3. Open the copied URL in a private browser window without connecting MetaMask.

Expected:

- The URL contains `?receipt=<id>`.
- The public page loads without a wallet connection.
- The receipt displays its release fields, builder, UTC timestamp, block number, and verified content hash.
- **View on BOTScan** opens the original `ReceiptCreated` transaction when event metadata is available.

### M-12 — Reject a nonexistent public receipt

1. Open the app with a receipt ID that does not exist, for example `?receipt=999999`.

Expected:

- The page displays **Receipt unavailable**.
- The message identifies that the requested receipt does not exist.
- No empty or falsely verified receipt is displayed.

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
| M-11 | ☐ Pass ☐ Fail | |
| M-12 | ☐ Pass ☐ Fail | |
