import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BaseError,
  createWalletClient,
  custom,
  getAddress,
  parseEventLogs,
  type Address,
  type Hash,
} from 'viem'
import { BOT_TESTNET_CHAIN_HEX, BOT_TESTNET_FEES, botTestnet } from '../config/chains'
import {
  BUILD_RECEIPT_ADDRESS,
  buildReceiptAbi,
} from '../config/contract'
import { publicClient, readBuilderReceipts, readReceipt } from '../lib/buildReceipt'
import type { ReceiptDraft, ReceiptRecord, TransactionState } from '../types'

const explorer = botTestnet.blockExplorers.default.url

function errorMessage(error: unknown, rejectedMessage = 'Connection request rejected in MetaMask. Your draft is still here.') {
  const code = typeof error === 'object' && error && 'code' in error ? error.code : undefined
  if (code === 4001) {
    return rejectedMessage
  }
  if (code === -32002) {
    return 'A MetaMask request is already pending. Open MetaMask from the browser toolbar and complete or reject it.'
  }
  if (error instanceof BaseError) return error.shortMessage
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export function useBuildReceipt() {
  const [account, setAccount] = useState<Address | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [state, setState] = useState<TransactionState>('disconnected')
  const [message, setMessage] = useState('Connect MetaMask to create an on-chain receipt.')
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null)
  const [history, setHistory] = useState<ReceiptRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [hasMetaMask, setHasMetaMask] = useState(() => typeof window !== 'undefined' && Boolean(window.ethereum))
  const connectionPending = useRef(false)

  const refreshHistory = useCallback(async (builder: Address) => {
    setHistoryLoading(true)
    try {
      setHistory(await readBuilderReceipts(builder))
    } catch (error) {
      setMessage(`Could not load receipt history: ${errorMessage(error)}`)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const syncWallet = useCallback(async () => {
    const provider = window.ethereum
    if (!provider) {
      setHasMetaMask(false)
      setState('disconnected')
      setMessage('No wallet found in this browser. Open BuildReceipt in MetaMask Mobile, or install and enable the MetaMask extension.')
      return
    }
    setHasMetaMask(true)

    const accounts = await provider.request({ method: 'eth_accounts' }) as string[]
    const currentChain = Number(await provider.request({ method: 'eth_chainId' }))
    setChainId(currentChain)

    if (!accounts[0]) {
      setAccount(null)
      setHistory([])
      setState('disconnected')
      setMessage('Connect MetaMask to create an on-chain receipt.')
      return
    }

    const address = getAddress(accounts[0])
    setAccount(address)
    setTransactionHash(null)
    if (currentChain !== botTestnet.id) {
      setState('wrong-network')
      setMessage('Switch MetaMask to BOT Chain Testnet before creating a receipt.')
      await refreshHistory(address)
      return
    }

    setState('ready')
    setMessage('Wallet connected. Review the permanent record before signing.')
    await refreshHistory(address)
  }, [refreshHistory])

  useEffect(() => {
    queueMicrotask(() => void syncWallet())
    const handleChange = () => void syncWallet()
    let provider = window.ethereum
    const addProviderListeners = () => {
      provider?.on?.('accountsChanged', handleChange)
      provider?.on?.('chainChanged', handleChange)
    }
    const removeProviderListeners = () => {
      provider?.removeListener?.('accountsChanged', handleChange)
      provider?.removeListener?.('chainChanged', handleChange)
    }
    const handleProviderReady = () => {
      if (provider !== window.ethereum) {
        removeProviderListeners()
        provider = window.ethereum
        addProviderListeners()
      }
      void syncWallet()
    }

    addProviderListeners()
    window.addEventListener('ethereum#initialized', handleProviderReady, { once: true })
    const providerCheck = window.setTimeout(handleProviderReady, 1500)
    return () => {
      window.clearTimeout(providerCheck)
      window.removeEventListener('ethereum#initialized', handleProviderReady)
      removeProviderListeners()
    }
  }, [syncWallet])

  const switchNetwork = useCallback(async () => {
    const provider = window.ethereum
    if (!provider) {
      setMessage('MetaMask was not detected. Install it to continue.')
      return false
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BOT_TESTNET_CHAIN_HEX }],
      })
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? error.code : undefined
      if (code !== 4902) {
        setState('error')
        setMessage(errorMessage(error))
        return false
      }

      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: BOT_TESTNET_CHAIN_HEX,
            chainName: botTestnet.name,
            nativeCurrency: botTestnet.nativeCurrency,
            rpcUrls: [...botTestnet.rpcUrls.default.http],
            blockExplorerUrls: [explorer],
          }],
        })
      } catch (addError) {
        setState('error')
        setMessage(errorMessage(addError))
        return false
      }
    }

    await syncWallet()
    return true
  }, [syncWallet])

  const connect = useCallback(async () => {
    const provider = window.ethereum
    if (!provider) {
      setMessage('MetaMask was not detected. Install it to continue.')
      return
    }

    if (connectionPending.current) {
      setState('connecting')
      setMessage('A MetaMask connection request is waiting. If the sidebar was closed, reopen MetaMask from your browser toolbar.')
      return
    }

    connectionPending.current = true
    setState('connecting')
    setMessage('A MetaMask connection request is waiting. If the sidebar was closed, reopen MetaMask from your browser toolbar.')
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
      const address = accounts[0] ? getAddress(accounts[0]) : null
      setAccount(address)
      const currentChain = Number(await provider.request({ method: 'eth_chainId' }))
      setChainId(currentChain)
      if (currentChain !== botTestnet.id) {
        setState('wrong-network')
        setMessage('Wallet connected. Approve the BOT Chain Testnet switch in MetaMask to continue.')
        if (address) void refreshHistory(address)
        await switchNetwork()
        return
      }
      setState('ready')
      setMessage('Wallet connected. Review the permanent record before signing.')
      if (address) await refreshHistory(address)
    } catch (error) {
      setState('error')
      setMessage(errorMessage(error))
    } finally {
      connectionPending.current = false
    }
  }, [refreshHistory, switchNetwork])

  const switchAccount = useCallback(async () => {
    const provider = window.ethereum
    if (!provider) {
      setMessage('MetaMask was not detected. Install it to continue.')
      return
    }

    if (connectionPending.current) {
      setState('connecting')
      setMessage('A MetaMask account request is already waiting. Reopen MetaMask from your browser toolbar to continue.')
      return
    }

    connectionPending.current = true
    setState('connecting')
    setMessage('Choose the account you want to use with BuildReceipt in MetaMask.')
    try {
      await provider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })
      await syncWallet()
    } catch (error) {
      setState('error')
      setMessage(errorMessage(error, 'Account switch canceled in MetaMask. The current wallet remains connected.'))
    } finally {
      connectionPending.current = false
    }
  }, [syncWallet])

  const createReceipt = useCallback(async (draft: ReceiptDraft) => {
    const provider = window.ethereum
    if (!provider || !account) {
      await connect()
      return null
    }
    if (chainId !== botTestnet.id && !(await switchNetwork())) return null

    setTransactionHash(null)
    setState('awaiting-wallet')
    setMessage('Awaiting approval in MetaMask…')

    try {
      const walletClient = createWalletClient({
        account,
        chain: botTestnet,
        transport: custom(provider),
      })
      const args = [draft.project, draft.version, draft.releaseUrl, draft.commitHash, draft.note] as const
      const simulation = await publicClient.simulateContract({
        account,
        address: BUILD_RECEIPT_ADDRESS,
        abi: buildReceiptAbi,
        functionName: 'createReceipt',
        args,
        ...BOT_TESTNET_FEES,
      })
      const hash = await walletClient.writeContract(simulation.request)
      setTransactionHash(hash)
      setState('confirming')
      setMessage('Transaction submitted. Waiting for BOT Chain confirmation…')

      const transactionReceipt = await publicClient.waitForTransactionReceipt({ hash })
      const [createdEvent] = parseEventLogs({
        abi: buildReceiptAbi,
        eventName: 'ReceiptCreated',
        logs: transactionReceipt.logs,
      })
      if (!createdEvent) throw new Error('ReceiptCreated event was not found in the transaction receipt.')

      const created = await readReceipt(createdEvent.args.receiptId)
      setSelectedReceipt(created)
      setState('confirmed')
      setMessage(`Receipt #${created.id.toString()} is confirmed on BOT Chain Testnet.`)
      await refreshHistory(account)
      return created
    } catch (error) {
      setState('error')
      setMessage(errorMessage(error))
      return null
    }
  }, [account, chainId, connect, refreshHistory, switchNetwork])

  const loadReceipt = useCallback(async (id: bigint) => {
    setReceiptLoading(true)
    setReceiptError(null)
    try {
      const receipt = await readReceipt(id)
      setSelectedReceipt(receipt)
      return receipt
    } catch (error) {
      setSelectedReceipt(null)
      setReceiptError(errorMessage(error))
      return null
    } finally {
      setReceiptLoading(false)
    }
  }, [])

  const clearSelectedReceipt = useCallback(() => setSelectedReceipt(null), [])

  return useMemo(() => ({
    account,
    chainId,
    state,
    message,
    transactionHash,
    selectedReceipt,
    history,
    historyLoading,
    receiptLoading,
    receiptError,
    hasMetaMask,
    connect,
    switchAccount,
    switchNetwork,
    createReceipt,
    loadReceipt,
    clearSelectedReceipt,
  }), [account, chainId, state, message, transactionHash, selectedReceipt, history, historyLoading, receiptLoading, receiptError, hasMetaMask, connect, switchAccount, switchNetwork, createReceipt, loadReceipt, clearSelectedReceipt])
}
