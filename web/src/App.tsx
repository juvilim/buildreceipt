import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { FlowRail } from './components/FlowRail'
import { Header } from './components/Header'
import { HeroIntro } from './components/HeroIntro'
import { LogoMark } from './components/LogoMark'
import { ReceiptComposer } from './components/ReceiptComposer'
import { ReceiptHistory } from './components/ReceiptHistory'
import { ReceiptPreview } from './components/ReceiptPreview'
import { StatusToast } from './components/StatusToast'
import { TransactionStatus } from './components/TransactionStatus'
import { BOT_CHAIN_WEBSITE_URL, botTestnet } from './config/chains'
import { useBuildReceipt } from './hooks/useBuildReceipt'
import { computeContentHash, validateDraft } from './lib/buildReceipt'
import type { ReceiptDraft } from './types'

const initialDraft: ReceiptDraft = {
  project: '',
  version: '',
  releaseUrl: '',
  commitHash: '',
  note: '',
}

const DRAFT_STORAGE_KEY = 'buildreceipt:draft:v2'

function App() {
  const [draft, setDraft] = useState<ReceiptDraft>(() => {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!stored) return initialDraft
    try { return { ...initialDraft, ...JSON.parse(stored) } }
    catch { return initialDraft }
  })
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const web3 = useBuildReceipt()
  const completedFields = useMemo(
    () => Object.values(draft).filter((value) => value.trim().length > 0).length,
    [draft],
  )
  const contentHash = useMemo(
    () => web3.account && completedFields === 5 ? computeContentHash(web3.account, draft) : null,
    [web3.account, completedFields, draft],
  )
  const busy = web3.state === 'awaiting-wallet' || web3.state === 'confirming'
  const submitLabel = !web3.hasMetaMask
    ? 'MetaMask required'
    : web3.state === 'connecting'
      ? 'Open MetaMask…'
      : !web3.account
        ? 'Connect wallet'
        : web3.chainId !== botTestnet.id
          ? 'Switch network'
          : busy
            ? web3.state === 'awaiting-wallet' ? 'Check MetaMask…' : 'Confirming…'
            : 'Create on-chain receipt'

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  }, [draft])

  async function submitReceipt() {
    setValidationMessage(null)
    if (!web3.account) {
      await web3.connect()
      return
    }
    if (web3.chainId !== botTestnet.id) {
      await web3.switchNetwork()
      return
    }
    const error = validateDraft(draft)
    if (error) {
      setValidationMessage(error)
      return
    }
    await web3.createReceipt(draft)
  }

  return (
    <div className="app-shell">
      <Header
        completedFields={completedFields}
        account={web3.account}
        hasMetaMask={web3.hasMetaMask}
        state={web3.state}
        onConnect={web3.connect}
        onSwitchNetwork={web3.switchNetwork}
      />
      {web3.state === 'connecting' && (
        <StatusToast
          key={`connecting-${web3.message}`}
          title="Action required in MetaMask"
          message={web3.message}
        />
      )}
      {web3.state === 'error' && (
        <StatusToast
          key={`error-${web3.message}`}
          title="Wallet action failed"
          message={web3.message}
          tone="error"
        />
      )}
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
              disabled={busy}
              submitDisabled={busy || web3.state === 'connecting'}
              submitLabel={submitLabel}
              onChange={(nextDraft) => {
                setDraft(nextDraft)
                setValidationMessage(null)
                web3.clearSelectedReceipt()
              }}
              onPrepare={submitReceipt}
            />
            <ReceiptPreview
              draft={draft}
              account={web3.account}
              contentHash={contentHash}
              receipt={web3.selectedReceipt}
            />
          </div>
        </section>
        <FlowRail />
        <TransactionStatus
          message={validationMessage ?? web3.message}
          completedFields={completedFields}
          state={validationMessage ? 'error' : web3.state}
          transactionHash={web3.transactionHash}
        />
        <ReceiptHistory
          account={web3.account}
          loading={web3.historyLoading}
          receipts={web3.history}
          onSelect={web3.selectReceipt}
        />
      </main>
      <footer className="site-footer section-wrap">
        <div>
          <LogoMark small />
          <span>BuildReceipt on BOT Chain</span>
        </div>
        <p>
          Immutable release evidence on{' '}
          <a href={BOT_CHAIN_WEBSITE_URL} target="_blank" rel="noreferrer">BOT Chain</a>
          {' '}·{' '}
          <a href={botTestnet.blockExplorers.default.url} target="_blank" rel="noreferrer">BOTScan</a>
        </p>
      </footer>
    </div>
  )
}

export default App
