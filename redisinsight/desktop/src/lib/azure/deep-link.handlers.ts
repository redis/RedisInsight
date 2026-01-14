import log from 'electron-log'
import { UrlWithParsedQuery } from 'url'
import { azureOauthCallback } from 'desktopSrc/lib/azure/azure-oauth.handlers'

export const azureDeepLinkHandler = async (url: UrlWithParsedQuery) => {
  switch (url?.pathname) {
    case '/oauth/callback':
      await azureOauthCallback(url)
      break
    default:
      log.warn('Unknown azure deep link pathname', url?.pathname)
  }
}
