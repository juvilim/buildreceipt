import type { Address } from 'viem'
import type { ReceiptRecord } from '../types'

type ReceiptHistoryProps = {
  account: Address | null
  loading: boolean
  receipts: ReceiptRecord[]
  copiedReceiptId: bigint | null
  onCopyProofLink: (receipt: ReceiptRecord) => void | Promise<void>
  onQuickView: (receipt: ReceiptRecord) => void
}

export function ReceiptHistory({ account, loading, receipts, copiedReceiptId, onCopyProofLink, onQuickView }: ReceiptHistoryProps) {
  const count = String(receipts.length).padStart(2, '0')
  return (
    <section className="history section-wrap" aria-labelledby="history-title">
      <div className="section-heading section-heading--row" id="history">
        <div>
          <p className="eyebrow">Connected wallet history</p>
          <h2 id="history-title">Receipts you can point to.</h2>
        </div>
        <span className="history-count tabular">{count} {receipts.length === 1 ? 'receipt' : 'receipts'}</span>
      </div>
      <div className="history-list">
        {loading && (
          <div className="history-empty" role="status">
            <strong>Reading receipt history…</strong>
            <p>Loading this wallet&apos;s records from BOT Chain Mainnet.</p>
          </div>
        )}
        {!loading && !account && (
          <div className="history-empty" role="status">
            <strong>Connect a wallet to view receipt history.</strong>
            <p>Your BuildReceipt records will load directly from BOT Chain Mainnet.</p>
          </div>
        )}
        {!loading && receipts.map((receipt) => (
          <article className="history-card" key={receipt.id}>
            <div className="history-id"><span>Receipt</span><strong className="tabular">#{String(receipt.id).padStart(6, '0')}</strong></div>
            <div className="history-primary"><h3>{receipt.project}</h3><p>{receipt.note}</p></div>
            <dl className="history-meta">
              <div><dt>Version</dt><dd>{receipt.version}</dd></div>
              <div><dt>Commit</dt><dd>{receipt.commitHash}</dd></div>
              <div><dt>Created</dt><dd>{new Date(Number(receipt.createdAt) * 1000).toLocaleString()}</dd></div>
            </dl>
            <div className="history-action">
              <span className="anchored-stamp">{receipt.verified ? 'Verified' : 'Hash mismatch'}</span>
              <a className="text-button history-public-link" href={`${import.meta.env.BASE_URL}?receipt=${receipt.id.toString()}`}>View proof</a>
              <button className="text-button" type="button" onClick={() => onQuickView(receipt)}>Quick view</button>
              <button className="text-button text-button--muted" type="button" onClick={() => void onCopyProofLink(receipt)}>
                {copiedReceiptId === receipt.id ? 'Link copied' : 'Copy proof link'}
              </button>
            </div>
          </article>
        ))}
        {!loading && account && receipts.length === 0 && (
          <div className="history-empty" role="status">
            <strong>This wallet has no BuildReceipt records yet.</strong>
            <p>Once created, receipts appear here as permanent, append-only release records.</p>
          </div>
        )}
      </div>
      {!loading && account && receipts.length > 0 && (
        <p className="mock-note">
          Loaded directly from the BuildReceipt contract.
        </p>
      )}
    </section>
  )
}
