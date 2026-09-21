import type { Address } from 'viem'

export const BUILD_RECEIPT_ADDRESS: Address =
  '0x6c788cbc498795c0e3247d843431adbd844f73b9'

export const BUILD_RECEIPT_DEPLOYMENT_BLOCK = 23_979_069n

export const FIELD_LIMITS = {
  project: 128,
  version: 128,
  releaseUrl: 2_048,
  commitHash: 128,
  note: 2_048,
} as const

export const buildReceiptAbi = [
  {
    type: 'function',
    name: 'createReceipt',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'project', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'releaseUrl', type: 'string' },
      { name: 'commitHash', type: 'string' },
      { name: 'note', type: 'string' },
    ],
    outputs: [{ name: 'receiptId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getReceiptIds',
    stateMutability: 'view',
    inputs: [{ name: 'builder', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'receiptCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'receipts',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'builder', type: 'address' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'contentHash', type: 'bytes32' },
      { name: 'project', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'releaseUrl', type: 'string' },
      { name: 'commitHash', type: 'string' },
      { name: 'note', type: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'ReceiptCreated',
    inputs: [
      { name: 'receiptId', type: 'uint256', indexed: true },
      { name: 'builder', type: 'address', indexed: true },
      { name: 'contentHash', type: 'bytes32', indexed: false },
    ],
  },
  {
    type: 'error',
    name: 'EmptyField',
    inputs: [{ name: 'fieldName', type: 'string' }],
  },
  {
    type: 'error',
    name: 'FieldTooLong',
    inputs: [
      { name: 'fieldName', type: 'string' },
      { name: 'maxLength', type: 'uint256' },
    ],
  },
] as const
