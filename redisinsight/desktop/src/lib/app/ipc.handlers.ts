import { app, ipcMain, nativeTheme } from 'electron'
import log from 'electron-log'
import {
  electronStore,
  setConsent,
  getUpdateStrategy,
  startUpdateDownload,
  checkForUpdate,
} from 'desktopSrc/lib'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
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
    process.env.RI_DISABLE_AUTO_UPGRADE === 'true' || process.mas
      ? null
      : getUpdateStrategy(),
  )

  ipcMain.handle(
    IpcInvokeEvent.setUpdateStrategy,
    (_event, strategy: AppUpdateStrategy) => {
      if (
        process.env.RI_DISABLE_AUTO_UPGRADE === 'true' ||
        process.mas ||
        !Object.values(AppUpdateStrategy).includes(strategy)
      ) {
        return
      }

      electronStore?.set(ElectronStorageItem.updateStrategy, strategy)

      checkForUpdate(
        process.env.RI_MANUAL_UPGRADES_LINK || process.env.RI_UPGRADES_LINK,
      ).catch((e) => log.error(wrapErrorMessageSensitiveData(e)))
    },
  )

  ipcMain.handle(IpcInvokeEvent.skipUpdateVersion, (_event, version: string) =>
    electronStore?.set(ElectronStorageItem.updateSkippedVersion, version),
  )

  ipcMain.handle(IpcInvokeEvent.appUpdateDownload, () => startUpdateDownload())
}
