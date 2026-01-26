import log from 'electron-log'
import axios from 'axios'
import { UrlWithParsedQuery } from 'url'
import { configMain as config } from 'desktopSrc/config'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getWindows } from 'desktopSrc/lib/window/browserWindow'
import { IpcOnEvent } from 'uiSrc/electron/constants'
import {
  AzureAuthStatus,
  AZURE_OAUTH_REDIRECT_PATH,
} from 'apiSrc/modules/azure/constants'
import { getAzureAuthService } from './azure-auth.service.provider'

// Extract pathname from redirect URI (e.g., '/oauth/callback' from 'redisinsight://azure/oauth/callback')
const AZURE_OAUTH_CALLBACK_PATH = new URL(AZURE_OAUTH_REDIRECT_PATH).pathname

/**
 * Handle callback via direct service call (production mode).
 * In production, the API is embedded in the Electron app.
 */
const handleCallbackViaService = async (code: string, state: string) => {
  const azureAuthService = getAzureAuthService()
  if (!azureAuthService) {
    throw new Error('Azure auth service not initialized')
  }
  return azureAuthService.handleCallback(code, state)
}

/**
 * Handle callback via HTTP request (development mode).
 * In development, the API runs as a separate process.
 */
const handleCallbackViaHttp = async (code: string, state: string) => {
  const apiBase = `http://localhost:${config.getApiPort()}/api`
  const response = await axios.get(`${apiBase}/azure/auth/callback`, {
    params: { code, state },
  })
  return response.data
}

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

    // Use direct service call in production, HTTP in development
    let result
    if (config.isDevelopment) {
      log.debug('Using HTTP callback handler (development mode)')
      result = await handleCallbackViaHttp(code as string, state as string)
    } else {
      log.debug('Using service callback handler (production mode)')
      result = await handleCallbackViaService(code as string, state as string)
    }

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

export const azureDeepLinkHandler = async (url: UrlWithParsedQuery) => {
  switch (url?.pathname) {
    case AZURE_OAUTH_CALLBACK_PATH:
      await azureOauthCallback(url)
      break
    default:
      log.warn('Unknown Azure deep link pathname', url?.pathname)
  }
}
