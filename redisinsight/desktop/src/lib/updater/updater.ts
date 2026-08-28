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
  isManualCheck: false,
  lastAvailableVersion: null as string | null,
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

let queuedRecheckUrl: string | null = null

export const checkForUpdate = async (url: string = '') => {
  if (!url || process.mas) {
    return
  }

  if (updateDownloadState.isDownloading) {
    queuedRecheckUrl = url
    return
  }

  updateDownloadState.isDownloading = true
  try {
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
      await res.downloadPromise
    }
  } finally {
    updateDownloadState.isDownloading = false
    updateDownloadState.isManualCheck = false
    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- mutual recursion with drainQueuedRecheck, both hoisted function declarations
    drainQueuedRecheck()
  }
}

export function drainQueuedRecheck() {
  if (queuedRecheckUrl) {
    const nextUrl = queuedRecheckUrl
    queuedRecheckUrl = null
    checkForUpdate(nextUrl).catch((e) =>
      log.error(wrapErrorMessageSensitiveData(e)),
    )
  }
}

export const startUpdateDownload = (version?: string) => {
  if (process.env.RI_DISABLE_AUTO_UPGRADE === 'true' || process.mas) {
    return
  }

  if (updateDownloadState.isDownloading) {
    sendUpdateState({ status: AppUpdateStatus.Error })
    return
  }

  if (
    updateDownloadState.downloadedInfo &&
    updateDownloadState.downloadedInfo.version === version
  ) {
    updateDownloadState.manuallyTriggered = true
    updateDownloadState.initiatingStrategy = getUpdateStrategy()
    updateDownloaded(updateDownloadState.downloadedInfo)
    updateDownloadState.manuallyTriggered = false
    return
  }

  updateDownloadState.isDownloading = true
  updateDownloadState.manuallyTriggered = true
  autoUpdater.downloadUpdate().catch((e) => {
    log.error(wrapErrorMessageSensitiveData(e))
    if (!updateDownloadState.manuallyTriggered) {
      return
    }
    updateDownloadState.isDownloading = false
    updateDownloadState.manuallyTriggered = false
    sendUpdateState({ status: AppUpdateStatus.Error })
    drainQueuedRecheck()
  })
}

export const triggerManualUpdateCheck = async (
  url: string = process.env.RI_MANUAL_UPGRADES_LINK ||
    process.env.RI_UPGRADES_LINK ||
    '',
): Promise<AppUpdateState> => {
  if (
    !url ||
    process.env.RI_DISABLE_AUTO_UPGRADE === 'true' ||
    process.mas ||
    updateDownloadState.isDownloading
  ) {
    return { status: AppUpdateStatus.Error }
  }

  updateDownloadState.isManualCheck = true

  try {
    await checkForUpdate(url)
  } catch (e) {
    log.error(wrapErrorMessageSensitiveData(e as Error))
    sendUpdateState({ status: AppUpdateStatus.Error })
    return { status: AppUpdateStatus.Error }
  }

  if (!electronStore?.get(ElectronStorageItem.isUpdateAvailable)) {
    return { status: AppUpdateStatus.NotAvailable }
  }

  electronStore?.delete(ElectronStorageItem.updateSkippedVersion)

  const state: AppUpdateState = {
    status: AppUpdateStatus.Available,
    version: updateDownloadState.lastAvailableVersion ?? undefined,
    manual: true,
  }
  sendUpdateState(state)
  return state
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
