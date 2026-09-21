import type { Address } from 'viem'
import { LogoMark } from './LogoMark'
import type { TransactionState } from '../types'

type HeaderProps = {
  completedFields: number
  account: Address | null
  hasMetaMask: boolean
  state: TransactionState
  receiptView?: boolean
  onConnect: () => void
  onSwitchAccount: () => void
  onSwitchNetwork: () => void
}

function shortAddress(address: Address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function Header({ completedFields, account, hasMetaMask, state, receiptView = false, onConnect, onSwitchAccount, onSwitchNetwork }: HeaderProps) {
  const wrongNetwork = state === 'wrong-network'
  const connecting = state === 'connecting'
  const networkLabel = !hasMetaMask
    ? 'MetaMask not found'
    : !account
      ? 'Wallet disconnected'
      : wrongNetwork ? 'Wrong network' : 'BOT Testnet'
  const buttonLabel = wrongNetwork
    ? 'Switch network'
    : connecting
      ? 'MetaMask pending'
      : account
        ? `${shortAddress(account)} · Switch`
        : 'Connect wallet'
  const handleWalletAction = wrongNetwork
    ? onSwitchNetwork
    : account
      ? onSwitchAccount
      : onConnect

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="BuildReceipt home">
        <LogoMark />
        <span className="brand-name">BuildReceipt</span>
      </a>
      {!receiptView && (
        <nav className="site-nav" aria-label="Primary navigation">
          <>
            <a href="#registry">Registry</a>
            <a href="#workspace">Build</a>
            <a href="#history">Receipts</a>
          </>
        </nav>
      )}
      {receiptView ? (
        <a className="button button--secondary header-build-link" href="/#workspace">Build a receipt</a>
      ) : (
        <div className="header-actions">
          <div className={`network-status ${wrongNetwork ? 'network-status--wrong' : ''} ${!account ? 'network-status--idle' : ''}`} role="status" aria-live="polite">
            <span className="status-dot" aria-hidden="true" />
            <span>{networkLabel}</span>
            <span className="status-divider" aria-hidden="true">/</span>
            <span className="tabular">{completedFields}/5 fields</span>
          </div>
          <button
            className="button button--secondary tabular"
            type="button"
            onClick={handleWalletAction}
            disabled={connecting}
            aria-describedby={connecting ? 'wallet-pending-help' : undefined}
          >
            {buttonLabel}
          </button>
          {connecting && (
            <span id="wallet-pending-help" className="sr-only">
              Open MetaMask from the browser toolbar to complete or reject the pending request.
            </span>
          )}
        </div>
      )}
    </header>
  )
}
