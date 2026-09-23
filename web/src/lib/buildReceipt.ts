import {
  createPublicClient,
  encodeAbiParameters,
  http,
  keccak256,
  zeroAddress,
  type Address,
} from 'viem'
import { botMainnet } from '../config/chains'
import {
  BUILD_RECEIPT_ADDRESS,
  BUILD_RECEIPT_DEPLOYMENT_BLOCK,
  buildReceiptAbi,
  FIELD_LIMITS,
} from '../config/contract'
import type { ReceiptDraft, ReceiptRecord } from '../types'

export const publicClient = createPublicClient({
  chain: botMainnet,
  transport: http(),
})

export function computeContentHash(builder: Address, draft: ReceiptDraft) {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'string' },
        { type: 'string' },
        { type: 'string' },
        { type: 'string' },
        { type: 'string' },
      ],
      [
        builder,
        draft.project,
        draft.version,
        draft.releaseUrl,
        draft.commitHash,
        draft.note,
      ],
    ),
  )
}

export function validateDraft(draft: ReceiptDraft) {
  const encoder = new TextEncoder()

  for (const key of Object.keys(FIELD_LIMITS) as Array<keyof ReceiptDraft>) {
    const value = draft[key].trim()
    if (!value) return `${fieldLabel(key)} is required.`
    if (encoder.encode(value).length > FIELD_LIMITS[key]) {
      return `${fieldLabel(key)} exceeds the ${FIELD_LIMITS[key]}-byte contract limit.`
    }
  }

  try {
    const url = new URL(draft.releaseUrl)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
  } catch {
    return 'Release URL must be a valid http or https URL.'
  }

  return null
}

function fieldLabel(key: keyof ReceiptDraft) {
  return ({
    project: 'Project',
    version: 'Version',
    releaseUrl: 'Release URL',
    commitHash: 'Commit hash',
    note: 'Release note',
  } satisfies Record<keyof ReceiptDraft, string>)[key]
}

export async function readReceipt(id: bigint): Promise<ReceiptRecord> {
  if (id < 1n) throw new Error('Receipt IDs start at 1.')

  const [result, event] = await Promise.all([
    publicClient.readContract({
      address: BUILD_RECEIPT_ADDRESS,
      abi: buildReceiptAbi,
      functionName: 'receipts',
      args: [id],
    }),
    publicClient.getContractEvents({
      address: BUILD_RECEIPT_ADDRESS,
      abi: buildReceiptAbi,
      eventName: 'ReceiptCreated',
      args: { receiptId: id },
      fromBlock: BUILD_RECEIPT_DEPLOYMENT_BLOCK,
      toBlock: 'latest',
    }).then(([created]) => created ?? null).catch(() => null),
  ])

  const [builder, createdAt, contentHash, project, version, releaseUrl, commitHash, note] = result
  if (builder === zeroAddress) throw new Error(`Receipt #${id.toString()} does not exist.`)
  const draft = { project, version, releaseUrl, commitHash, note }

  return {
    id,
    builder,
    createdAt,
    contentHash,
    ...draft,
    verified: computeContentHash(builder, draft) === contentHash,
    transactionHash: event?.transactionHash ?? null,
    blockNumber: event?.blockNumber ?? null,
  }
}

export async function readBuilderReceipts(builder: Address) {
  const ids = await publicClient.readContract({
    address: BUILD_RECEIPT_ADDRESS,
    abi: buildReceiptAbi,
    functionName: 'getReceiptIds',
    args: [builder],
  })

  const receipts = await Promise.all(ids.map(readReceipt))
  return receipts.reverse()
}
