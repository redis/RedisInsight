import { ipcMain } from 'electron'
import log from 'electron-log'
import open from 'open'
import axios from 'axios'
import { UrlWithParsedQuery } from 'url'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { focusWindow, getWindows } from 'desktopSrc/lib/window/browserWindow'
import { IpcInvokeEvent, IpcOnEvent } from 'uiSrc/electron/constants'

const API_BASE = 'http://localhost:5540/api'

export interface AzureAuthResponse {
  status: 'succeed' | 'failed'
  error?: string
}

export const initAzureOauthHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.azureOauth, async () => {
    try {
      // Get auth URL from backend
      const response = await axios.get(`${API_BASE}/azure/auth/login`)
      const { url } = response.data

      // Open URL in default browser
      await open(url)

      return { status: 'succeed' }
    } catch (e) {
      log.error('Azure OAuth error:', wrapErrorMessageSensitiveData(e as Error))
      const error: AzureAuthResponse = {
        status: 'failed',
        error: (e as Error).message,
      }
      const [currentWindow] = getWindows().values()
      currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, error)
      return error
    }
  })
}

export const azureOauthCallback = async (url: UrlWithParsedQuery) => {
  try {
    const code = url.query?.code as string
    const state = url.query?.state as string

    if (!code) {
      throw new Error('No authorization code received')
    }

    // Send the code to the backend to complete the OAuth flow
    await axios.post(`${API_BASE}/azure/auth/callback`, { code, state })

    const result: AzureAuthResponse = { status: 'succeed' }

    // Focus the window and notify the UI
    const [currentWindow] = getWindows().values()
    if (currentWindow) {
      currentWindow.show()
      currentWindow.webContents.send(IpcOnEvent.azureOauthCallback, result)
      focusWindow(currentWindow)
    }
  } catch (e) {
    log.error('Azure OAuth callback error:', wrapErrorMessageSensitiveData(e as Error))
    const error: AzureAuthResponse = {
      status: 'failed',
      error: (e as Error).message,
    }
    const [currentWindow] = getWindows().values()
    currentWindow?.webContents.send(IpcOnEvent.azureOauthCallback, error)
  }
}

