import { trim } from 'lodash'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()
const isDevelopment = riConfig.app.env === 'development'
const isWebApp = riConfig.app.type === 'web'
const { apiPort } = window.app?.config || { apiPort: riConfig.api.port }
const hostedApiBaseUrl = riConfig.api.hostedBaseUrl

export const getSocketApiUrl = (path = '') => {
  let baseUrl = getBaseApiUrl()
  try {
    const url = new URL(baseUrl)
    baseUrl = url.origin
  } catch (e) {
    console.error(e)
  }
  return `${baseUrl}/${trim(path, '/')}`
}

export const getBaseApiUrl = () => {
  if (hostedApiBaseUrl) {
    return hostedApiBaseUrl
  }

  return !isDevelopment && isWebApp
    ? window.location.origin
    : `${riConfig.api.baseUrl}:${apiPort}`
}

export const getProxyPath = () => {
  if (window.__RI_PROXY_PATH__) {
    return `/${window.__RI_PROXY_PATH__}/socket.io`
  }

  if (riConfig.api.hostedSocketProxyPath) {
    return riConfig.api.hostedSocketProxyPath
  }

  return '/socket.io'
}

type Node = number | string | JSX.Element

export const getNodeText = (node: Node | Node[]): string => {
  if (['string', 'number'].includes(typeof node)) return node?.toString()
  if (node instanceof Array) return node.map(getNodeText).join('')
  if (typeof node === 'object' && node) return getNodeText(node.props.children)
  return ''
}

export const removeSymbolsFromStart = (str = '', symbol = ''): string => {
  if (str.startsWith(symbol)) {
    return str.slice(symbol.length)
  }
  return str
}

export const openNewWindowDatabase = (location: string) => {
  if (isWebApp) {
    window.open(window.location.origin + location)
    return
  }

  window.app?.ipc?.invoke(IpcInvokeEvent.windowOpen, { location })
}

export const handleCopy = (text = '') => {
  navigator?.clipboard?.writeText(text)
}
