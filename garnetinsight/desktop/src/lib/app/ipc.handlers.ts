import { app, ipcMain, nativeTheme } from 'electron'
import { electronStore } from 'desktopSrc/lib'
import { ElectronStorageItem, IpcInvokeEvent } from 'uiSrc/electron/constants'

export const initIPCHandlers = () => {
  ipcMain.handle(IpcInvokeEvent.getAppVersion, () => app?.getVersion())

  ipcMain.handle(IpcInvokeEvent.getStoreValue, (_event, key) =>
    electronStore?.get(key),
  )

  ipcMain.handle(IpcInvokeEvent.deleteStoreValue, (_event, key) =>
    electronStore?.delete(key),
  )

  ipcMain.handle(IpcInvokeEvent.themeChange, (_event, theme: string) => {
    const themeSource = theme.toLowerCase() as typeof nativeTheme.themeSource

    nativeTheme.themeSource = themeSource
    electronStore?.set(ElectronStorageItem.themeSource, themeSource)
  })
}
