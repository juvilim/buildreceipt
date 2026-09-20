import { defineChain, numberToHex } from 'viem'

export const botTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: {
      name: 'BOTScan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
})

export const BOT_TESTNET_CHAIN_HEX = numberToHex(botTestnet.id)

export const BOT_TESTNET_FEES = {
  maxPriorityFeePerGas: 20_000_000_000n,
  maxFeePerGas: 40_000_000_000n,
} as const

export const BOT_CHAIN_WEBSITE_URL = 'https://www.botchain.ai'

export function botTestnetTransactionUrl(hash: string) {
  return `${botTestnet.blockExplorers.default.url}/tx/${hash}`
}
