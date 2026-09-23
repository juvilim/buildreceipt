import { botMainnet } from '../config/chains'
import { BUILD_RECEIPT_ADDRESS } from '../config/contract'

const contractUrl = `${botMainnet.blockExplorers.default.url}/address/${BUILD_RECEIPT_ADDRESS}`

export function HeroIntro() {
  return (
    <section className="hero-intro section-wrap" id="top">
      <div className="hero-grid" id="registry">
        <div className="hero-main">
          <p className="eyebrow">On-chain shipping log for developers</p>
          <h1>Proof that<br /><em>you shipped.</em></h1>
          <p className="hero-copy">
            Turn a release URL, version, and commit into permanent evidence—signed
            by the builder and timestamped on BOT Chain.
          </p>
          <div className="hero-meta" aria-label="Product qualities">
            <span>Append-only</span>
            <span>No administrator</span>
            <span>Builder-owned</span>
          </div>
        </div>
        <aside className="hero-protocol" aria-label="BuildReceipt public registry">
          <div className="protocol-topline">
            <span>PUBLIC_REGISTRY</span>
            <span className="protocol-state"><i aria-hidden="true" /> CONTRACT_LIVE</span>
          </div>
          <dl className="registry-details">
            <div><dt>Network</dt><dd>{botMainnet.name}</dd></div>
            <div><dt>Chain ID</dt><dd>{botMainnet.id}</dd></div>
            <div><dt>Contract</dt><dd>{`${BUILD_RECEIPT_ADDRESS.slice(0, 8)}…${BUILD_RECEIPT_ADDRESS.slice(-6)}`}</dd></div>
            <div><dt>Record</dt><dd>Append-only</dd></div>
          </dl>
          <a className="protocol-link" href={contractUrl} target="_blank" rel="noreferrer">View deployed contract <span aria-hidden="true">↗</span></a>
        </aside>
      </div>
    </section>
  )
}
