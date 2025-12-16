import { ipcMain } from 'electron'
import log from 'electron-log'
import open from 'open'
import axios from 'axios'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'

const API_BASE = 'http://localhost:5540/api'

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
      return {
        status: 'failed',
        error: (e as Error).message,
      }
    }
  })
}

