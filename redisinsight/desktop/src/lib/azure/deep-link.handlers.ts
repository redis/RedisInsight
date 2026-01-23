import log from 'electron-log'
import axios from 'axios'
import { UrlWithParsedQuery } from 'url'
import { configMain as config } from 'desktopSrc/config'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getWindows } from 'desktopSrc/lib/window/browserWindow'
import { IpcOnEvent } from 'uiSrc/electron/constants'

const getApiBase = () => `http://localhost:${config.getApiPort()}/api`

/**
 * Handle Azure OAuth callback from deep link.
 * Forwards the authorization code to the backend API.
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
        status: 'failed',
        error: errorDescription || error,
      })
      return
    }

    if (!code) {
      log.error('Azure OAuth callback missing authorization code')
      currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, {
        status: 'failed',
        error: 'Missing authorization code',
      })
      return
    }

    // Forward to backend API
    const response = await axios.get(`${getApiBase()}/azure/auth/callback`, {
      params: { code, state },
    })

    currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, {
      status: 'succeed',
      data: response.data,
    })
    currentWindow?.focus()
  } catch (e) {
    log.error(
      'Azure OAuth callback error:',
      wrapErrorMessageSensitiveData(e as Error),
    )
    currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, {
      status: 'failed',
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
