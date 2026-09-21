import type { Address, Hex } from 'viem'
import { botTestnet } from '../config/chains'
import type { ReceiptDraft, ReceiptRecord } from '../types'

type ReceiptPreviewProps = {
  draft: ReceiptDraft
  account: Address | null
  contentHash: Hex | null
  receipt: ReceiptRecord | null
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

export function ReceiptPreview({ draft, account, contentHash, receipt }: ReceiptPreviewProps) {
  const shown = receipt ?? draft
  const anchored = Boolean(receipt)
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
          <div><span>Builder</span><strong>{receipt ? shortAddress(receipt.builder) : account ? shortAddress(account) : 'Not connected'}</strong></div>
          <div><span>Network</span><strong>{botTestnet.name} · {botTestnet.id}</strong></div>
        </div>
        <div className="receipt-digest">
          <span>Content hash</span>
          <code>{receipt?.contentHash ?? contentHash ?? 'Generated after wallet connection'}</code>
        </div>
        <p className="receipt-footer">Permanent · Append-only · Builder-signed</p>
        <div className="stamp" aria-label={anchored ? 'Verified content hash' : 'Draft—not yet recorded on-chain'}>
          {anchored ? 'Verified' : 'Draft'}
        </div>
      </div>
      <p className="preview-caption">
        {receipt
          ? `Recorded ${new Date(Number(receipt.createdAt) * 1000).toLocaleString()} · Content hash ${receipt.verified ? 'matches' : 'does not match'}.`
          : 'The final content hash is generated from the builder and every release field.'}
      </p>
    </aside>
  )
}
