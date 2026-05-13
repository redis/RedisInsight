import { ipcMain, WebContents } from 'electron'
import log from 'electron-log'
import open from 'open'
import {
  CloudAuthRequestOptions,
  CloudAuthResponse,
  CloudAuthStatus,
} from 'apiClient'
import { UrlWithParsedQuery } from 'url'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'

import { IpcOnEvent, IpcInvokeEvent } from 'uiSrc/electron/constants'

import { CloudOauthUnexpectedErrorException } from 'apiSrc/modules/cloud/auth/exceptions'
import { createAuthStrategy } from '../auth/auth.factory'
import { getWindows } from '../window/browserWindow'

// Defaults for the single-user / single-session case the desktop OAuth flow
// operates under. Mirrors the BE constants in api/src/common/constants/user.ts.
const DEFAULT_SESSION_ID = '1'
const DEFAULT_USER_ID = '1'

const authStrategy = createAuthStrategy()

export const getOauthIpcErrorResponse = (
  error: any,
): { status: CloudAuthStatus.Failed; error: {} } => {
  let errorResponse = new CloudOauthUnexpectedErrorException().getResponse()

  if (error?.getResponse) {
    errorResponse = error.getResponse()
  } else if (error instanceof Error) {
    errorResponse = new CloudOauthUnexpectedErrorException(
      error.message,
    ).getResponse()
  }

  return {
    status: CloudAuthStatus.Failed,
    error: errorResponse,
  }
}

export const getTokenCallbackFunction =
  (webContents: WebContents) => (response: CloudAuthResponse) => {
    webContents.send(IpcOnEvent.cloudOauthCallback, response)
    webContents.focus()
  }

export const initCloudOauthHandlers = () => {
  ipcMain.handle(
    IpcInvokeEvent.cloudOauth,
    async (event, options: CloudAuthRequestOptions) => {
      try {
        await authStrategy.initialize()
        const { url } = await authStrategy.getAuthUrl({
          sessionMetadata: {
            sessionId: DEFAULT_SESSION_ID,
            userId: DEFAULT_USER_ID,
          },
          authOptions: {
            ...options,
            callback: getTokenCallbackFunction(event?.sender as WebContents),
          },
        })

        await open(url)

        return {
          status: CloudAuthStatus.Succeed,
        }
      } catch (e) {
        log.error(wrapErrorMessageSensitiveData(e as Error))
        const error = getOauthIpcErrorResponse(e)
        const [currentWindow] = getWindows().values()
        currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, error)
        return error
      }
    },
  )
}

export const cloudOauthCallback = async (url: UrlWithParsedQuery) => {
  try {
    const result = await authStrategy.handleCallback(url.query)

    if (result.status === CloudAuthStatus.Failed) {
      const [currentWindow] = getWindows().values()
      currentWindow?.webContents.send(IpcOnEvent.cloudOauthCallback, result)
    }
  } catch (e) {
    log.error(wrapErrorMessageSensitiveData(e as Error))
  }
}
