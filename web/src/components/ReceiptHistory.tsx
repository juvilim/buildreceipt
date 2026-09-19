import type { MockReceipt } from '../types'

const mockReceipts: MockReceipt[] = [{
  id: 1,
  builder: '0x6d80683CE6e499b7bC499a5716B824959b9BCFe9',
  createdAt: '20 Sep 2026 · 01:40 WIB',
  network: 'BOT Testnet',
  project: 'BuildReceipt',
  version: '0.1.0-testnet',
  releaseUrl: 'https://scan.bohr.life/address/0x6c788cbc498795c0e3247d843431adbd844f73b9',
  commitHash: '02c4a7d',
  note: 'Gate 3 verification receipt',
}]

export function ReceiptHistory() {
  return (
    <section className="history section-wrap" aria-labelledby="history-title" id="history">
      <div className="section-heading section-heading--row">
        <div>
          <p className="eyebrow">Connected wallet history</p>
          <h2 id="history-title">Receipts you can point to.</h2>
        </div>
        <span className="history-count tabular">01 receipt</span>
      </div>
      <div className="history-list">
        {mockReceipts.map((receipt) => (
          <article className="history-card" key={receipt.id}>
            <div className="history-id"><span>Receipt</span><strong className="tabular">#{String(receipt.id).padStart(6, '0')}</strong></div>
            <div className="history-primary"><h3>{receipt.project}</h3><p>{receipt.note}</p></div>
            <dl className="history-meta">
              <div><dt>Version</dt><dd>{receipt.version}</dd></div>
              <div><dt>Commit</dt><dd>{receipt.commitHash}</dd></div>
              <div><dt>Created</dt><dd>{receipt.createdAt}</dd></div>
            </dl>
            <div className="history-action">
              <span className="anchored-stamp">Anchored</span>
              <button className="text-button" type="button">View receipt <span aria-hidden="true">↗</span></button>
            </div>
          </article>
        ))}
      </div>
      <p className="mock-note">Showing mocked history for layout validation. Live contract reads come next.</p>
    </section>
  )
}
