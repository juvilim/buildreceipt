import { useMemo, useState } from 'react'
import './App.css'
import { FlowRail } from './components/FlowRail'
import { Header } from './components/Header'
import { HeroIntro } from './components/HeroIntro'
import { LogoMark } from './components/LogoMark'
import { ReceiptComposer } from './components/ReceiptComposer'
import { ReceiptHistory } from './components/ReceiptHistory'
import { ReceiptPreview } from './components/ReceiptPreview'
import { TransactionStatus } from './components/TransactionStatus'
import type { ReceiptDraft } from './types'

const initialDraft: ReceiptDraft = {
  project: 'BuildReceipt',
  version: '0.1.0-testnet',
  releaseUrl: 'https://scan.bohr.life/address/0x6c788cbc498795c0e3247d843431adbd844f73b9',
  commitHash: '02c4a7d',
  note: 'First verified release receipt on BOT Chain Testnet.',
}

function App() {
  const [draft, setDraft] = useState<ReceiptDraft>(initialDraft)
  const [statusMessage, setStatusMessage] = useState(
    'Preview mode — no wallet transactions will be sent.',
  )
  const completedFields = useMemo(
    () => Object.values(draft).filter((value) => value.trim().length > 0).length,
    [draft],
  )

  return (
    <div className="app-shell">
      <Header
        completedFields={completedFields}
        onConnect={() => setStatusMessage('Wallet connection will be enabled during Web3 integration.')}
      />
      <main>
        <HeroIntro />
        <section className="workspace section-wrap" aria-labelledby="workspace-title" id="workspace">
          <div className="section-heading">
            <p className="eyebrow">Draft workspace</p>
            <h2 id="workspace-title">Compose the proof. Check every detail.</h2>
          </div>
          <div className="workspace-grid">
            <ReceiptComposer
              draft={draft}
              onChange={setDraft}
              onPrepare={() => setStatusMessage('Draft prepared locally. Review the receipt before signing.')}
            />
            <ReceiptPreview draft={draft} />
          </div>
        </section>
        <FlowRail />
        <TransactionStatus message={statusMessage} completedFields={completedFields} />
        <ReceiptHistory />
      </main>
      <footer className="site-footer section-wrap">
        <div>
          <LogoMark small />
          <span>BuildReceipt on BOT Chain</span>
        </div>
        <p>Immutable release evidence, anchored on an EVM-compatible network.</p>
      </footer>
    </div>
  )
}

export default App
