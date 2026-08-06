import { app, ipcMain, nativeTheme } from 'electron'
import {
  electronStore,
  setConsent,
  getUpdateStrategy,
  startUpdateDownload,
} from 'desktopSrc/lib'
import {
  AppUpdateStrategy,
  ElectronStorageItem,
  IpcInvokeEvent,
} from 'uiSrc/electron/constants'

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

  ipcMain.handle(IpcInvokeEvent.setSentryConsent, (_event, granted: boolean) =>
    setConsent(!!granted),
  )

  ipcMain.handle(IpcInvokeEvent.getUpdateStrategy, () =>
    process.env.RI_DISABLE_AUTO_UPGRADE === 'true' ? null : getUpdateStrategy(),
  )

  ipcMain.handle(
    IpcInvokeEvent.setUpdateStrategy,
    (_event, strategy: AppUpdateStrategy) => {
      if (Object.values(AppUpdateStrategy).includes(strategy)) {
        electronStore?.set(ElectronStorageItem.updateStrategy, strategy)
      }
    },
  )

  ipcMain.handle(IpcInvokeEvent.skipUpdateVersion, (_event, version: string) =>
    electronStore?.set(ElectronStorageItem.updateSkippedVersion, version),
  )

  ipcMain.handle(IpcInvokeEvent.appUpdateDownload, () => startUpdateDownload())
}
