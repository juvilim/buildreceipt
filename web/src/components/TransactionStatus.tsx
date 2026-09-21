import type { Hash } from 'viem'
import { botTestnetTransactionUrl } from '../config/chains'
import type { TransactionState } from '../types'

type TransactionStatusProps = {
  message: string
  completedFields: number
  state: TransactionState
  transactionHash: Hash | null
}

const stateLabels: Record<TransactionState, string> = {
  disconnected: 'DISCONNECTED',
  connecting: 'CONNECTING',
  'wrong-network': 'WRONG_NETWORK',
  ready: 'READY',
  'awaiting-wallet': 'AWAITING_WALLET',
  confirming: 'CONFIRMING',
  confirmed: 'CONFIRMED',
  error: 'ERROR',
}

export function TransactionStatus({ message, completedFields, state, transactionHash }: TransactionStatusProps) {
  return (
    <section className={`transaction-status transaction-status--${state} section-wrap`} aria-labelledby="transaction-title">
      <div className="transaction-copy">
        <span className="status-icon" aria-hidden="true">{state === 'confirmed' ? '✓' : state === 'error' || state === 'wrong-network' ? '!' : 'i'}</span>
        <div>
          <h2 id="transaction-title">TX_STATUS: {stateLabels[state]}</h2>
          <p role="status" aria-live="polite">{message}</p>
          {transactionHash && (
            <a className="transaction-link" href={botTestnetTransactionUrl(transactionHash)} target="_blank" rel="noreferrer">
              View transaction on BOTScan <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
      <div className="readiness">
        <span>Receipt readiness</span>
        <strong className="tabular">{completedFields}/5 fields</strong>
        <span className="readiness-meter" aria-label={`${completedFields} of 5 receipt fields completed`}>
          {Array.from({ length: 5 }, (_, index) => (
            <i className={index < completedFields ? 'is-complete' : ''} key={index} aria-hidden="true" />
          ))}
        </span>
      </div>
    </section>
  )
}
