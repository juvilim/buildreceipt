import { useState } from 'react'
import type { Address, Hex } from 'viem'
import { botMainnet, botMainnetTransactionUrl } from '../config/chains'
import type { ReceiptDraft, ReceiptRecord } from '../types'

type ReceiptPreviewProps = {
  draft: ReceiptDraft
  account: Address | null
  contentHash: Hex | null
  receipt: ReceiptRecord | null
  copied?: boolean
  showPublicLink?: boolean
  onCopyProofLink?: (receipt: ReceiptRecord) => void | Promise<void>
}

function shortAddress(address: Address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="receipt-row">
      <dt>{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
}

function receiptTimestamp(createdAt: bigint) {
  return new Date(Number(createdAt) * 1000).toISOString().replace('T', ' ').replace('.000Z', ' UTC')
}

export function ReceiptPreview({ draft, account, contentHash, receipt, copied = false, showPublicLink = true, onCopyProofLink }: ReceiptPreviewProps) {
  const shown = receipt ?? draft
  const anchored = Boolean(receipt)
  const shownHash = receipt?.contentHash ?? contentHash
  const [copiedHash, setCopiedHash] = useState<Hex | null>(null)

  async function copyContentHash() {
    if (!shownHash) return
    await navigator.clipboard.writeText(shownHash)
    setCopiedHash(shownHash)
  }

  return (
    <aside className="preview-panel" aria-labelledby="preview-title">
      <div className="preview-status">
        <span>On-chain receipt</span>
        <span><i aria-hidden="true" /> {anchored ? 'Anchored / verified' : 'Draft / local'}</span>
      </div>
      <div className="receipt-paper">
        <div className="receipt-topline">
          <div>
            <p className="receipt-label">BuildReceipt // Release record</p>
            <h3 id="preview-title">Release proof</h3>
          </div>
          <span className="receipt-number tabular">#{receipt ? receipt.id.toString().padStart(6, '0') : 'NEW'}</span>
        </div>
        <div className="receipt-rule" />
        <dl className="receipt-details">
          <PreviewRow label="Project" value={shown.project} />
          <PreviewRow label="Version" value={shown.version} />
          <PreviewRow label="Release" value={shown.releaseUrl} />
          <PreviewRow label="Commit" value={shown.commitHash} />
          <PreviewRow label="Note" value={shown.note} />
        </dl>
        <div className="receipt-rule receipt-rule--dashed" />
        <div className="receipt-signature">
          <div><span>Builder</span><strong>{receipt ? receipt.builder : account ? shortAddress(account) : 'Not connected'}</strong></div>
          <div><span>Network</span><strong>{botMainnet.name} · {botMainnet.id}</strong></div>
          <div><span>Created</span><strong>{receipt ? receiptTimestamp(receipt.createdAt) : 'After confirmation'}</strong></div>
          <div><span>Block</span><strong>{receipt?.blockNumber?.toString() ?? (receipt ? 'See BOTScan' : 'After confirmation')}</strong></div>
        </div>
        <div className="receipt-digest">
          <div className="receipt-digest__top">
            <span>Content hash</span>
            {shownHash && (
              <button className="receipt-copy" type="button" onClick={() => void copyContentHash()}>
                {copiedHash === shownHash ? 'Hash copied' : 'Copy hash'}
              </button>
            )}
          </div>
          <code title={shownHash ?? undefined}>{shownHash ?? 'Generated after wallet connection'}</code>
        </div>
        <p className="receipt-footer">Permanent · Append-only · Builder-signed</p>
        <div className="stamp" aria-label={anchored ? 'Verified content hash' : 'Draft—not yet recorded on-chain'}>
          {anchored ? 'Verified' : 'Draft'}
        </div>
      </div>
      {receipt && (
        <div className="receipt-actions" aria-label="Receipt actions">
          {showPublicLink && (
            <a className="button button--primary" href={`${import.meta.env.BASE_URL}?receipt=${receipt.id.toString()}`}>
              View proof
            </a>
          )}
          {onCopyProofLink && (
            <button className="button button--secondary" type="button" onClick={() => void onCopyProofLink(receipt)}>
              {copied ? 'Proof link copied' : 'Copy proof link'}
            </button>
          )}
          {receipt.transactionHash && (
            <a className="button button--secondary" href={botMainnetTransactionUrl(receipt.transactionHash)} target="_blank" rel="noreferrer">
              View on BOTScan <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}
      <p className="preview-caption">
        {receipt
          ? `Content hash ${receipt.verified ? 'matches the stored release fields' : 'does not match the stored release fields'}.`
          : 'The final content hash is generated from the builder and every release field.'}
      </p>
    </aside>
  )
}
