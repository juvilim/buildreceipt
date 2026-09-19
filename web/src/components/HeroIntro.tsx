export function HeroIntro() {
  return (
    <section className="hero-intro section-wrap" id="top">
      <div className="hero-grid">
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
        <aside className="hero-protocol" aria-label="BuildReceipt protocol summary">
          <div className="protocol-topline">
            <span>RELEASE_PROTOCOL</span>
            <span className="protocol-state"><i aria-hidden="true" /> TESTNET_READY</span>
          </div>
          <ol>
            <li><span>01</span><strong>Describe</strong><small>Release details</small></li>
            <li><span>02</span><strong>Authorize</strong><small>Wallet transaction</small></li>
            <li><span>03</span><strong>Anchor</strong><small>BOT Chain record</small></li>
            <li><span>04</span><strong>Prove</strong><small>Shareable receipt</small></li>
          </ol>
          <p>Quiet, precise, permanent.</p>
        </aside>
      </div>
    </section>
  )
}
