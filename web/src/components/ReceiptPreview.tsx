import type { ReceiptDraft } from '../types'

type ReceiptPreviewProps = { draft: ReceiptDraft }

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="receipt-row">
      <dt>{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
}

export function ReceiptPreview({ draft }: ReceiptPreviewProps) {
  return (
    <aside className="preview-panel" aria-labelledby="preview-title">
      <div className="preview-status">
        <span>On-chain receipt</span>
        <span><i aria-hidden="true" /> Draft / local</span>
      </div>
      <div className="receipt-paper">
        <div className="receipt-topline">
          <div>
            <p className="receipt-label">BuildReceipt // Release record</p>
            <h3 id="preview-title">Release proof</h3>
          </div>
          <span className="receipt-number tabular">#000001</span>
        </div>
        <div className="receipt-rule" />
        <dl className="receipt-details">
          <PreviewRow label="Project" value={draft.project} />
          <PreviewRow label="Version" value={draft.version} />
          <PreviewRow label="Release" value={draft.releaseUrl} />
          <PreviewRow label="Commit" value={draft.commitHash} />
          <PreviewRow label="Note" value={draft.note} />
        </dl>
        <div className="receipt-rule receipt-rule--dashed" />
        <div className="receipt-signature">
          <div><span>Builder</span><strong>0x6d80…CFe9</strong></div>
          <div><span>Network</span><strong>BOT Testnet · 968</strong></div>
        </div>
        <div className="receipt-digest">
          <span>Content hash</span>
          <code>Generated after wallet connection</code>
        </div>
        <div className="stamp" aria-label="Draft—not yet recorded on-chain">Draft</div>
      </div>
      <p className="preview-caption">The final content hash is generated from the builder and every release field.</p>
    </aside>
  )
}
