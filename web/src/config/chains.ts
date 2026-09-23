import { defineChain, numberToHex } from 'viem'

export const botMainnet = defineChain({
  id: 677,
  name: 'BOT Chain Mainnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
  },
  blockExplorers: {
    default: {
      name: 'BOTScan',
      url: 'https://scan.botchain.ai',
    },
  },
  testnet: false,
})

export const BOT_MAINNET_CHAIN_HEX = numberToHex(botMainnet.id)

export const BOT_MAINNET_FEES = {
  maxPriorityFeePerGas: 20_000_000_000n,
  maxFeePerGas: 40_000_000_000n,
} as const

export const BOT_CHAIN_WEBSITE_URL = 'https://www.botchain.ai'

export function botMainnetTransactionUrl(hash: string) {
  return `${botMainnet.blockExplorers.default.url}/tx/${hash}`
}
