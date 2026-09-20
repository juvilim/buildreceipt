/// <reference types="vite/client" />

import type { EIP1193Provider } from 'viem'

type ProviderListener = (...args: unknown[]) => void

declare global {
  interface Window {
    ethereum?: EIP1193Provider & {
      on?: (event: string, listener: ProviderListener) => void
      removeListener?: (event: string, listener: ProviderListener) => void
    }
  }
}

export {}
