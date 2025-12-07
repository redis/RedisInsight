import { contextBridge, ipcRenderer } from 'electron'
import { configRenderer as config } from 'desktopSrc/config/configRenderer'
import { IpcInvokeEvent, IpcOnEvent } from 'uiSrc/electron/constants'
import { WindowApp } from 'uiSrc/types'

const ipcHandler = {
  invoke: (channel: IpcInvokeEvent, data?: any) => {
    // whitelist channels
    if (Object.values(IpcInvokeEvent).includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }

    return new Error('channel is not allowed')
  },
}

contextBridge.exposeInMainWorld('app', {
  // Send data from main to render
  sendWindowId: (windowId: any) => {
    ipcRenderer.on(IpcOnEvent.sendWindowId, windowId)
  },
  cloudOauthCallback: (connected: any) => {
    ipcRenderer.on(IpcOnEvent.cloudOauthCallback, connected)
  },
  deepLinkAction: (parsedDeepLink: any) => {
    ipcRenderer.on(IpcOnEvent.deepLinkAction, parsedDeepLink)
  },
  updateAvailable: (updateInfo: any) => {
    ipcRenderer.on(IpcOnEvent.appUpdateAvailable, updateInfo)
  },
  ipc: ipcHandler,
  config: {
    apiPort: config.apiPort,
  },
} as WindowApp)

export type IPCHandler = typeof ipcHandler
