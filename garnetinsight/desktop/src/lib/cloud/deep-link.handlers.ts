import log from 'electron-log'
import { UrlWithParsedQuery } from 'url'
import { cloudOauthCallback } from 'desktopSrc/lib/cloud/cloud-oauth.handlers'

export const cloudDeepLinkHandler = async (url: UrlWithParsedQuery) => {
  switch (url?.pathname) {
    case '/oauth/callback':
      await cloudOauthCallback(url)
      break
    default:
      log.warn('Unknown cloud deep link pathname', url?.pathname)
  }
}
