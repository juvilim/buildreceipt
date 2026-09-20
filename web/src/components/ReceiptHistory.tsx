import type { Address } from 'viem'
import type { ReceiptRecord } from '../types'

type ReceiptHistoryProps = {
  account: Address | null
  loading: boolean
  receipts: ReceiptRecord[]
  onSelect: (receipt: ReceiptRecord) => void
}

export function ReceiptHistory({ account, loading, receipts, onSelect }: ReceiptHistoryProps) {
  const count = String(receipts.length).padStart(2, '0')
  return (
    <section className="history section-wrap" aria-labelledby="history-title" id="history">
      <div className="section-heading section-heading--row">
        <div>
          <p className="eyebrow">Connected wallet history</p>
          <h2 id="history-title">Receipts you can point to.</h2>
        </div>
        <span className="history-count tabular">{count} {receipts.length === 1 ? 'receipt' : 'receipts'}</span>
      </div>
      <div className="history-list">
        {receipts.map((receipt) => (
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
              <button className="text-button" type="button" onClick={() => onSelect(receipt)}>View receipt <span aria-hidden="true">↗</span></button>
            </div>
          </article>
        ))}
      </div>
      <p className="mock-note">
        {loading
          ? 'Reading receipts from BOT Chain Testnet…'
          : !account
            ? 'Connect a wallet to load its on-chain receipt history.'
            : receipts.length === 0
              ? 'This wallet has no BuildReceipt records yet.'
              : 'Loaded directly from the BuildReceipt contract.'}
      </p>
    </section>
  )
}
