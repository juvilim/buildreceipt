export type ReceiptDraft = {
  project: string
  version: string
  releaseUrl: string
  commitHash: string
  note: string
}

import type { Address, Hex } from 'viem'

export type ReceiptRecord = ReceiptDraft & {
  id: bigint
  builder: Address
  createdAt: bigint
  contentHash: Hex
  verified: boolean
}

export type TransactionState =
  | 'disconnected'
  | 'connecting'
  | 'wrong-network'
  | 'ready'
  | 'awaiting-wallet'
  | 'confirming'
  | 'confirmed'
  | 'error'
