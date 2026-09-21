import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { HeroIntro } from './components/HeroIntro'
import { LogoMark } from './components/LogoMark'
import { ReceiptComposer } from './components/ReceiptComposer'
import { ReceiptDialog } from './components/ReceiptDialog'
import { ReceiptHistory } from './components/ReceiptHistory'
import { ReceiptPreview } from './components/ReceiptPreview'
import { StatusToast } from './components/StatusToast'
import { TransactionStatus } from './components/TransactionStatus'
import { BOT_CHAIN_WEBSITE_URL, botTestnet } from './config/chains'
import { useBuildReceipt } from './hooks/useBuildReceipt'
import { computeContentHash, validateDraft } from './lib/buildReceipt'
import type { ReceiptDraft, ReceiptRecord } from './types'

const initialDraft: ReceiptDraft = {
  project: '',
  version: '',
  releaseUrl: '',
  commitHash: '',
  note: '',
}

const DRAFT_STORAGE_KEY = 'buildreceipt:draft:v2'

type ReceiptRoute = {
  requested: boolean
  id: bigint | null
  error: string | null
}

function receiptRouteFromLocation(): ReceiptRoute {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('receipt')) return { requested: false, id: null, error: null }
  const value = params.get('receipt') ?? ''
  if (!/^\d+$/.test(value) || BigInt(value) < 1n) {
    return {
      requested: true,
      id: null,
      error: 'Receipt ID must be a positive whole number, such as 1.',
    }
  }
  return { requested: true, id: BigInt(value), error: null }
}

function receiptProofUrl(id: bigint) {
  const url = new URL(window.location.origin)
  url.pathname = window.location.pathname
  url.searchParams.set('receipt', id.toString())
  return url.toString()
}

function App() {
  const [draft, setDraft] = useState<ReceiptDraft>(() => {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!stored) return initialDraft
    try { return { ...initialDraft, ...JSON.parse(stored) } }
    catch { return initialDraft }
  })
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [receiptRoute] = useState<ReceiptRoute>(receiptRouteFromLocation)
  const sharedReceiptId = receiptRoute.id
  const [copiedReceiptId, setCopiedReceiptId] = useState<bigint | null>(null)
  const [historyReceipt, setHistoryReceipt] = useState<ReceiptRecord | null>(null)
  const web3 = useBuildReceipt()
  const loadReceipt = web3.loadReceipt
  const completedFields = useMemo(
    () => Object.values(draft).filter((value) => value.trim().length > 0).length,
    [draft],
  )
  const contentHash = useMemo(
    () => web3.account && completedFields === 5 ? computeContentHash(web3.account, draft) : null,
    [web3.account, completedFields, draft],
  )
  const draftValidationError = useMemo(() => validateDraft(draft), [draft])
  const draftReady = draftValidationError === null
  const busy = web3.state === 'awaiting-wallet' || web3.state === 'confirming'
  const submitLabel = !web3.hasMetaMask
    ? 'MetaMask required'
    : web3.state === 'connecting'
      ? 'Open MetaMask…'
      : busy
        ? web3.state === 'awaiting-wallet' ? 'Check MetaMask…' : 'Confirming…'
        : !draftReady
          ? completedFields === 5 ? 'Fix invalid release details' : 'Complete release details'
          : !web3.account
            ? 'Connect wallet to sign'
            : web3.chainId !== botTestnet.id
              ? 'Switch network'
              : 'Create on-chain receipt'

  useEffect(() => {
    if (Object.values(draft).every((value) => value === '')) {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      return
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
  }, [draft])

  useEffect(() => {
    if (receiptRoute.requested || !window.location.hash) return
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
    if (!target) return
    const frame = window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }))
    return () => window.cancelAnimationFrame(frame)
  }, [receiptRoute.requested])

  useEffect(() => {
    if (!receiptRoute.requested) return
    if (!sharedReceiptId) {
      document.title = 'Invalid receipt — BuildReceipt'
      return
    }
    document.title = `Receipt #${sharedReceiptId.toString()} — BuildReceipt`
    void loadReceipt(sharedReceiptId)
  }, [receiptRoute.requested, sharedReceiptId, loadReceipt])

  async function copyProofLink(receiptId: bigint) {
    await navigator.clipboard.writeText(receiptProofUrl(receiptId))
    setCopiedReceiptId(receiptId)
  }

  function clearSelectedReceipt() {
    const url = new URL(window.location.href)
    url.searchParams.delete('receipt')
    url.hash = 'workspace'
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    web3.clearSelectedReceipt()
  }

  async function submitReceipt() {
    setValidationMessage(null)
    if (draftValidationError) {
      setValidationMessage(draftValidationError)
      return
    }
    if (!web3.account) {
      await web3.connect()
      return
    }
    if (web3.chainId !== botTestnet.id) {
      await web3.switchNetwork()
      return
    }
    const created = await web3.createReceipt(draft)
    if (created) setDraft(initialDraft)
  }

  return (
    <div className="app-shell">
      <Header
        completedFields={completedFields}
        account={web3.account}
        hasMetaMask={web3.hasMetaMask}
        state={web3.state}
        receiptView={receiptRoute.requested}
        onConnect={web3.connect}
        onSwitchAccount={web3.switchAccount}
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
      {receiptRoute.requested ? (
        <main className="shared-receipt section-wrap" id="receipt">
          <div className="shared-receipt__heading">
            <p className="eyebrow">Public receipt verification</p>
            <h1>Proof anyone can verify.</h1>
            <p>Loaded directly from the immutable BuildReceipt registry on BOT Chain Testnet.</p>
          </div>
          {receiptRoute.error && <div className="history-empty history-empty--error" role="alert"><strong>Invalid receipt link</strong><p>{receiptRoute.error}</p></div>}
          {sharedReceiptId && web3.receiptLoading && <div className="history-empty" role="status"><strong>Loading receipt #{sharedReceiptId.toString()}…</strong><p>Reading the public record from BOT Chain Testnet.</p></div>}
          {web3.receiptError && <div className="history-empty history-empty--error" role="alert"><strong>Receipt unavailable</strong><p>{web3.receiptError}</p></div>}
          {!web3.receiptLoading && web3.selectedReceipt && (
            <div className="shared-receipt__card">
              <ReceiptPreview
                draft={initialDraft}
                account={null}
                contentHash={null}
                receipt={web3.selectedReceipt}
                copied={copiedReceiptId === web3.selectedReceipt.id}
                showPublicLink={false}
                onCopyProofLink={(receipt) => copyProofLink(receipt.id)}
              />
            </div>
          )}
        </main>
      ) : (
        <main>
          <HeroIntro />
          <section className="workspace section-wrap" aria-labelledby="workspace-title">
          <div className="section-heading" id="workspace">
            <p className="eyebrow">Draft workspace</p>
            <h2 id="workspace-title">Compose the proof. Check every detail.</h2>
          </div>
          <div className="workspace-grid">
            <ReceiptComposer
              draft={draft}
              disabled={busy}
              submitLabel={submitLabel}
              validationMessage={completedFields === 5 ? draftValidationError : null}
              onChange={(nextDraft) => {
                setDraft(nextDraft)
                setValidationMessage(null)
                clearSelectedReceipt()
              }}
              submitDisabled={busy || web3.state === 'connecting' || !web3.hasMetaMask || !draftReady}
              onPrepare={submitReceipt}
            />
            <ReceiptPreview
              draft={draft}
              account={web3.account}
              contentHash={contentHash}
              receipt={web3.selectedReceipt}
              copied={Boolean(web3.selectedReceipt && copiedReceiptId === web3.selectedReceipt.id)}
              onCopyProofLink={(receipt) => copyProofLink(receipt.id)}
            />
          </div>
        </section>
        <TransactionStatus
          message={validationMessage ?? web3.message}
          completedFields={completedFields}
          state={validationMessage ? 'error' : web3.state}
          transactionHash={web3.transactionHash}
          draftReady={draftReady}
          draftError={draftValidationError}
        />
        <ReceiptHistory
          account={web3.account}
          loading={web3.historyLoading}
          receipts={web3.history}
          copiedReceiptId={copiedReceiptId}
          onCopyProofLink={(receipt) => copyProofLink(receipt.id)}
          onQuickView={setHistoryReceipt}
        />
        </main>
      )}
      {historyReceipt && (
        <ReceiptDialog
          receipt={historyReceipt}
          copied={copiedReceiptId === historyReceipt.id}
          onCopyProofLink={(receipt) => copyProofLink(receipt.id)}
          onClose={() => setHistoryReceipt(null)}
        />
      )}
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
