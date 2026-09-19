type TransactionStatusProps = { message: string; completedFields: number }

export function TransactionStatus({ message, completedFields }: TransactionStatusProps) {
  return (
    <section className="transaction-status section-wrap" aria-labelledby="transaction-title">
      <div className="transaction-copy">
        <span className="status-icon" aria-hidden="true">i</span>
        <div>
          <h2 id="transaction-title">TX_STATUS: DRAFT</h2>
          <p role="status" aria-live="polite">{message}</p>
        </div>
      </div>
      <div className="readiness">
        <span>Receipt readiness</span>
        <strong className="tabular">{completedFields}/5 fields</strong>
      </div>
    </section>
  )
}
