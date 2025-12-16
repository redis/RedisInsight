import { initAzureOauthHandlers } from 'desktopSrc/lib/azure/azure-oauth.handlers'

export { azureDeepLinkHandler } from 'desktopSrc/lib/azure/deep-link.handlers'

export const initAzureHandlers = () => {
  initAzureOauthHandlers()
}
