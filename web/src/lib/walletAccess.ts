export const METAMASK_DOWNLOAD_URL = 'https://metamask.io/download/'

export function isMobileBrowser() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function metaMaskDappUrl() {
  if (typeof window === 'undefined') return METAMASK_DOWNLOAD_URL
  const dappUrl = `${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`
  return `https://metamask.app.link/dapp/${dappUrl}`
}
