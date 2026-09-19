export type ReceiptDraft = {
  project: string
  version: string
  releaseUrl: string
  commitHash: string
  note: string
}

export type MockReceipt = ReceiptDraft & {
  id: number
  builder: string
  createdAt: string
  network: string
}
