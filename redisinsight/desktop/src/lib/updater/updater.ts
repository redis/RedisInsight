import { app } from 'electron'
import log from 'electron-log'
import { UpdateDownloadedEvent, autoUpdater } from 'electron-updater'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getWindows } from 'desktopSrc/lib/window'
import { electronStore } from 'desktopSrc/lib/store/store'
import {
  AppUpdateState,
  AppUpdateStatus,
  ElectronStorageItem,
  IpcOnEvent,
  AppUpdateStrategy,
} from 'uiSrc/electron/constants'

export const updateDownloadState = {
  isDownloading: false,
  manuallyTriggered: false,
  downloadedInfo: null as UpdateDownloadedEvent | null,
  initiatingStrategy: null as AppUpdateStrategy | null,
}

export const getUpdateStrategy = (): AppUpdateStrategy => {
  const stored = electronStore?.get(ElectronStorageItem.updateStrategy)
  return Object.values(AppUpdateStrategy).includes(stored as AppUpdateStrategy)
    ? (stored as AppUpdateStrategy)
    : AppUpdateStrategy.auto
}

export const sendToRenderer = (
  channel: IpcOnEvent,
  payload: any,
  delay = 0,
) => {
  setTimeout(() => {
    const [currentWindow] = getWindows().values()

    currentWindow?.webContents.send(channel, payload)
  }, delay)
}

export const UNPROMPTED_NOTIFICATION_DELAY = 60 * 1_000

export const updateDownloaded = (updateInfo: UpdateDownloadedEvent) => {
  const delay =
    updateDownloadState.manuallyTriggered &&
    updateDownloadState.initiatingStrategy === AppUpdateStrategy.notify
      ? 0
      : UNPROMPTED_NOTIFICATION_DELAY
  sendToRenderer(IpcOnEvent.appUpdateAvailable, updateInfo, delay)
}

export const sendUpdateState = (state: AppUpdateState) => {
  sendToRenderer(IpcOnEvent.appUpdateState, state)
}

export const checkForUpdate = async (url: string = '') => {
  if (!url || process.mas || updateDownloadState.isDownloading) {
    return
  }

  log.info('AppUpdater initialization')
  log.transports.file.level = 'info'

  try {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url,
    })
  } catch (_err) {
    const error = _err as Error
    log.error(wrapErrorMessageSensitiveData(error))
  }

  updateDownloadState.initiatingStrategy = getUpdateStrategy()
  autoUpdater.forceDevUpdateConfig = !app.isPackaged
  autoUpdater.autoDownload =
    updateDownloadState.initiatingStrategy !== AppUpdateStrategy.notify
  autoUpdater.autoInstallOnAppQuit = true

  const res = await autoUpdater.checkForUpdates()

  if (res?.downloadPromise) {
    updateDownloadState.isDownloading = true
    try {
      await res.downloadPromise
    } finally {
      updateDownloadState.isDownloading = false
    }
  }
}

export const startUpdateDownload = () => {
  if (
    process.env.RI_DISABLE_AUTO_UPGRADE === 'true' ||
    process.mas ||
    updateDownloadState.isDownloading
  ) {
    return
  }

  updateDownloadState.isDownloading = true
  updateDownloadState.manuallyTriggered = true
  autoUpdater.downloadUpdate().catch((e) => {
    updateDownloadState.isDownloading = false
    updateDownloadState.manuallyTriggered = false
    log.error(wrapErrorMessageSensitiveData(e))
    sendUpdateState({ status: AppUpdateStatus.Error })
  })
}

export const initAutoUpdateChecks = (url = '', interval = 84 * 3600 * 1000) => {
  checkForUpdate(url)
    .catch((e) => log.error(wrapErrorMessageSensitiveData(e)))
    .finally(() => {
      setTimeout(() => initAutoUpdateChecks(url, interval), interval)
    })
}

export const quitAndInstallUpdate = () => {
  autoUpdater.quitAndInstall(true, true)
}
