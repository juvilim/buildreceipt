import { LogoMark } from './LogoMark'

type HeaderProps = {
  completedFields: number
  onConnect: () => void
}

export function Header({ completedFields, onConnect }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="BuildReceipt home">
        <LogoMark />
        <span className="brand-name">BuildReceipt</span>
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#workspace">Build</a>
        <a href="#flow">How it works</a>
        <a href="#history">Receipts</a>
      </nav>
      <div className="header-actions">
        <div className="network-status" role="status" aria-live="polite">
          <span className="status-dot" aria-hidden="true" />
          <span>BOT Testnet</span>
          <span className="status-divider" aria-hidden="true">/</span>
          <span className="tabular">{completedFields}/5 ready</span>
        </div>
        <button className="button button--secondary" type="button" onClick={onConnect}>
          Connect wallet
        </button>
      </div>
    </header>
  )
}
