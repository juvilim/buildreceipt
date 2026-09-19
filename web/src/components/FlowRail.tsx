const steps = [
  { number: '01', title: 'Compose', detail: 'Add release evidence' },
  { number: '02', title: 'Review', detail: 'Confirm the exact record' },
  { number: '03', title: 'Sign', detail: 'Approve with your wallet' },
  { number: '04', title: 'Prove', detail: 'Share the BOTScan receipt' },
]

export function FlowRail() {
  return (
    <section className="flow-rail section-wrap" aria-labelledby="flow-title" id="flow">
      <div className="flow-heading">
        <p className="eyebrow">How it works</p>
        <h2 id="flow-title">From release to receipt.</h2>
      </div>
      <ol className="flow-list">
        {steps.map((step) => (
          <li key={step.number}>
            <span className="flow-number tabular">{step.number}</span>
            <div><strong>{step.title}</strong><span>{step.detail}</span></div>
            <span className="flow-arrow" aria-hidden="true">→</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
