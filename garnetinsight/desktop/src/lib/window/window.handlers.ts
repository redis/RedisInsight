import { BrowserWindow, app, shell, ipcMain } from 'electron'
import {
  MenuBuilder,
  getDisplayAppInTrayValue,
  getIsQuiting,
  getTray,
  getTrayInstance,
  electronStore,
  windowFactory,
  WindowType,
  quitAndInstallUpdate,
} from 'desktopSrc/lib'
import {
  IpcInvokeEvent,
  ElectronStorageItem,
  IpcOnEvent,
} from 'uiSrc/electron/constants'

export const initWindowHandlers = (
  newWindow: BrowserWindow,
  splash: BrowserWindow | null = null,
  windows: Map<string, BrowserWindow>,
  id: string,
) => {
  const tray = getTray()
  const trayInstance = getTrayInstance()

  newWindow.webContents.on('did-finish-load', () => {
    if (!newWindow) {
      throw new Error('"newWindow" is not defined')
    }

    // set up windowId to preload.js
    newWindow.webContents.send(IpcOnEvent.sendWindowId, id)

    const zoomFactor =
      (electronStore?.get(ElectronStorageItem.zoomFactor) as number) ?? null
    if (zoomFactor) {
      newWindow?.webContents.setZoomFactor(zoomFactor)
    }

    if (!trayInstance?.isDestroyed()) {
      tray?.updateTooltip(newWindow.webContents.getTitle())
    }

    if (process.env.START_MINIMIZED) {
      newWindow.minimize()
    } else {
      newWindow?.show()
      newWindow?.focus()
      splash?.destroy()
    }
  })

  newWindow.on('page-title-updated', () => {
    if (newWindow && !trayInstance?.isDestroyed()) {
      tray?.updateTooltip(newWindow.webContents.getTitle())
      tray?.buildContextMenu()
    }
  })

  newWindow.on('close', (event) => {
    electronStore?.set(ElectronStorageItem.bounds, newWindow.getNormalBounds())

    if (!getIsQuiting() && getDisplayAppInTrayValue() && windows.size === 1) {
      event.preventDefault()
      newWindow?.hide()
      app.dock?.hide()
    }
  })

  newWindow.on('closed', () => {
    if (newWindow && id) {
      windows.delete(id)
      // newWindow = null
    }

    if (!trayInstance?.isDestroyed()) {
      tray?.buildContextMenu()
    }
  })

  newWindow.on('focus', () => {
    if (newWindow) {
      const menuBuilder = new MenuBuilder(newWindow)
      menuBuilder.buildMenu()

      if (!trayInstance?.isDestroyed()) {
        tray?.updateTooltip(newWindow.webContents.getTitle())
      }
    }
  })

  // Open urls in the user's browser
  newWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  newWindow.webContents.setWindowOpenHandler((edata: any) => {
    shell.openExternal(edata.url)
    return { action: 'deny' }
  })
}

export const initWindowIPCHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.windowOpen, async (_event, { location }) => {
    await windowFactory(WindowType.Main, null, {
      parsedDeepLink: { initialPage: location },
    })
  })
  ipcMain.handle(IpcInvokeEvent.appRestart, async () => {
    quitAndInstallUpdate()
  })
}
