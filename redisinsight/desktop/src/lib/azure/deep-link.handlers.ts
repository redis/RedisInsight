import log from 'electron-log'
import { UrlWithParsedQuery } from 'url'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getWindows } from 'desktopSrc/lib/window/browserWindow'
import { IpcOnEvent } from 'uiSrc/electron/constants'
import { AzureAuthStatus } from 'apiSrc/modules/azure/constants'
import { getAzureAuthService } from './azure-auth.service.provider'

/**
 * Handle Azure OAuth callback from deep link.
 * Calls the AzureAuthService directly to exchange the authorization code.
 */
const azureOauthCallback = async (url: UrlWithParsedQuery) => {
  const [currentWindow] = getWindows().values()

  try {
    const {
      code,
      state,
      error,
      error_description: errorDescription,
    } = url.query

    // Handle OAuth errors from Azure
    if (error) {
      log.error('Azure OAuth error:', error, errorDescription)
      currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, {
        status: AzureAuthStatus.Failed,
        error: errorDescription || error,
      })
      return
    }

    if (!code || !state) {
      log.error('Azure OAuth callback missing code or state')
      currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, {
        status: AzureAuthStatus.Failed,
        error: 'Missing authorization code or state',
      })
      return
    }

    // Call the service directly
    const azureAuthService = getAzureAuthService()
    if (!azureAuthService) {
      log.error('AzureAuthService not available')
      currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, {
        status: AzureAuthStatus.Failed,
        error: 'Azure auth service not initialized',
      })
      return
    }

    const result = await azureAuthService.handleCallback(
      code as string,
      state as string,
    )

    currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, {
      status: result.status,
      account: result.account,
    })
    currentWindow?.focus()
  } catch (e) {
    log.error(
      'Azure OAuth callback error:',
      wrapErrorMessageSensitiveData(e as Error),
    )
    currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, {
      status: AzureAuthStatus.Failed,
      error: (e as Error).message,
    })
  }
}

/**
 * Handle Azure deep link URLs.
 * Routes to appropriate handler based on pathname.
 *
 * Supported paths:
 * - /oauth/callback - OAuth authorization code callback
 */
export const azureDeepLinkHandler = async (url: UrlWithParsedQuery) => {
  switch (url?.pathname) {
    case '/oauth/callback':
      await azureOauthCallback(url)
      break
    default:
      log.warn('Unknown Azure deep link pathname', url?.pathname)
  }
}
