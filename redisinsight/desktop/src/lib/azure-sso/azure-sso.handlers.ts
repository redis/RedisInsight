import http, { Server } from 'http'
import { URL } from 'url'
import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import {
  PublicClientApplication,
  CryptoProvider,
  LogLevel,
} from '@azure/msal-node'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'

import { IpcOnEvent, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { getWindows } from '../window/browserWindow'

// Azure SSO Configuration (PoC values)
const AZURE_CONFIG = {
  CLIENT_ID: 'f9895a25-74d6-40ca-ba97-a547ea0b5717',
  TENANT_ID: 'be18ca4e-bb52-4385-8b6a-0ecfb7e7033c',
  REDIRECT_PORT: 5541,
  SCOPES: [
    'openid',
    'profile',
    'offline_access',
    'https://management.azure.com/user_impersonation',
  ],
}

const getAuthority = () =>
  `https://login.microsoftonline.com/${AZURE_CONFIG.TENANT_ID}`
const getRedirectUri = () => `http://localhost:${AZURE_CONFIG.REDIRECT_PORT}`

// Store for pending auth requests
interface PendingAuthRequest {
  verifier: string
  callback: (result: AzureSsoAuthResult) => void
  server: Server
}

const pendingAuthRequests = new Map<string, PendingAuthRequest>()

export enum AzureSsoAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}

export interface AzureSsoAuthResult {
  status: AzureSsoAuthStatus
  message?: string
  error?: any
  data?: {
    accessToken: string
    expiresOn: Date
    oid: string
    upn: string
  }
}

// Create MSAL client
const createMsalClient = () =>
  new PublicClientApplication({
    auth: {
      clientId: AZURE_CONFIG.CLIENT_ID,
      authority: getAuthority(),
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        loggerCallback: (_level: LogLevel, message: string) => {
          log.info(`[MSAL] ${message}`)
        },
      },
    },
  })

const cryptoProvider = new CryptoProvider()

export const getAzureSsoIpcErrorResponse = (
  error: any,
): { status: AzureSsoAuthStatus.Failed; error: any } => {
  let errorMessage = 'An unexpected error occurred'

  if (error?.message) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  }

  return {
    status: AzureSsoAuthStatus.Failed,
    error: { message: errorMessage },
  }
}

export const getAzureSsoCallbackFunction =
  (webContents: WebContents) => (response: AzureSsoAuthResult) => {
    log.info('[Azure SSO] Sending callback to renderer')
    webContents.send(IpcOnEvent.azureSsoOauthCallback, response)
    webContents.focus()
  }

/**
 * Start a temporary HTTP server to catch the OAuth callback
 */
const startCallbackServer = (
  state: string,
  verifier: string,
  callback: (result: AzureSsoAuthResult) => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url || '/', getRedirectUri())
        const code = url.searchParams.get('code')
        const returnedState = url.searchParams.get('state')
        const error = url.searchParams.get('error')
        const errorDescription = url.searchParams.get('error_description')

        log.info('[Azure SSO] Callback received on temp server')

        // Handle error from Azure
        if (error) {
          log.error('[Azure SSO] Auth error:', error, errorDescription)
          const result: AzureSsoAuthResult = {
            status: AzureSsoAuthStatus.Failed,
            message: `${error}: ${errorDescription}`,
          }
          callback(result)
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(getErrorHtml(error, errorDescription || ''))
          cleanupServer(returnedState || state)
          return
        }

        // Validate state
        if (returnedState !== state) {
          log.error('[Azure SSO] State mismatch')
          const result: AzureSsoAuthResult = {
            status: AzureSsoAuthStatus.Failed,
            message: 'Invalid state parameter',
          }
          callback(result)
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end(getErrorHtml('State mismatch', 'Invalid state parameter'))
          cleanupServer(state)
          return
        }

        if (!code) {
          log.error('[Azure SSO] No code received')
          const result: AzureSsoAuthResult = {
            status: AzureSsoAuthStatus.Failed,
            message: 'No authorization code received',
          }
          callback(result)
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end(getErrorHtml('Missing code', 'No authorization code'))
          cleanupServer(state)
          return
        }

        // Exchange code for tokens
        try {
          const pca = createMsalClient()
          const tokenResponse = await pca.acquireTokenByCode({
            code,
            redirectUri: getRedirectUri(),
            codeVerifier: verifier,
            scopes: AZURE_CONFIG.SCOPES,
          })

          const claims = tokenResponse.idTokenClaims as Record<string, any>
          const oid = claims?.oid || claims?.sub || ''
          const upn = claims?.preferred_username || claims?.email || ''

          log.info('[Azure SSO] Token acquired successfully')
          log.info(`[Azure SSO] User: ${upn}, OID: ${oid}`)

          const result: AzureSsoAuthResult = {
            status: AzureSsoAuthStatus.Succeed,
            data: {
              accessToken: tokenResponse.accessToken,
              expiresOn: tokenResponse.expiresOn || new Date(),
              oid,
              upn,
            },
          }

          callback(result)
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(getSuccessHtml(upn))
        } catch (tokenError: any) {
          log.error('[Azure SSO] Token exchange error:', tokenError)
          const result: AzureSsoAuthResult = {
            status: AzureSsoAuthStatus.Failed,
            message: tokenError?.message || 'Failed to exchange code for token',
          }
          callback(result)
          res.writeHead(500, { 'Content-Type': 'text/html' })
          res.end(getErrorHtml('Token Error', tokenError?.message || 'Unknown'))
        }

        cleanupServer(state)
      } catch (e: any) {
        log.error('[Azure SSO] Server error:', e)
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal server error')
        cleanupServer(state)
      }
    })

    server.on('error', (err) => {
      log.error('[Azure SSO] Server error:', err)
      reject(err)
    })

    server.listen(AZURE_CONFIG.REDIRECT_PORT, () => {
      log.info(
        `[Azure SSO] Callback server started on port ${AZURE_CONFIG.REDIRECT_PORT}`,
      )
      pendingAuthRequests.set(state, { verifier, callback, server })
      resolve()
    })
  })

const cleanupServer = (state: string) => {
  const pending = pendingAuthRequests.get(state)
  if (pending) {
    pending.server.close(() => {
      log.info('[Azure SSO] Callback server closed')
    })
    pendingAuthRequests.delete(state)
  }
}

const getSuccessHtml = (upn: string) => `
<!DOCTYPE html>
<html>
<head><title>Azure SSO - Success</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 50px;">
  <h1>✅ Authentication Successful</h1>
  <p>Logged in as: <strong>${upn || 'Unknown'}</strong></p>
  <p>You can close this window and return to RedisInsight.</p>
</body>
</html>
`

const getErrorHtml = (error: string, description: string) => `
<!DOCTYPE html>
<html>
<head><title>Azure SSO - Error</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 50px;">
  <h1>❌ Authentication Failed</h1>
  <p><strong>Error:</strong> ${error}</p>
  <p>${description}</p>
  <p>Please close this window and try again.</p>
</body>
</html>
`

export const initAzureSsoHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.azureSsoOauth, async (event) => {
    try {
      log.info('[Azure SSO] Starting OAuth flow')

      // Generate PKCE codes
      const { verifier, challenge } = await cryptoProvider.generatePkceCodes()
      const state = cryptoProvider.createNewGuid()
      const nonce = cryptoProvider.createNewGuid()

      // Set up callback function
      const callbackFn = getAzureSsoCallbackFunction(
        event?.sender as WebContents,
      )

      // Start the callback server first
      await startCallbackServer(state, verifier, callbackFn)

      // Build authorization URL
      const url = new URL(`${getAuthority()}/oauth2/v2.0/authorize`)
      url.searchParams.append('client_id', AZURE_CONFIG.CLIENT_ID)
      url.searchParams.append('response_type', 'code')
      url.searchParams.append('redirect_uri', getRedirectUri())
      url.searchParams.append('response_mode', 'query')
      url.searchParams.append('scope', AZURE_CONFIG.SCOPES.join(' '))
      url.searchParams.append('state', state)
      url.searchParams.append('nonce', nonce)
      url.searchParams.append('code_challenge', challenge)
      url.searchParams.append('code_challenge_method', 'S256')

      log.info('[Azure SSO] Opening authorization URL in browser')
      await open(url.toString())

      return {
        status: AzureSsoAuthStatus.Succeed,
      }
    } catch (e) {
      log.error(
        '[Azure SSO] Error:',
        wrapErrorMessageSensitiveData(e as Error),
      )
      const error = getAzureSsoIpcErrorResponse(e)
      const [currentWindow] = getWindows().values()
      currentWindow?.webContents.send(IpcOnEvent.azureSsoOauthCallback, error)
      return error
    }
  })

  log.info('[Azure SSO] IPC handlers initialized')
}

