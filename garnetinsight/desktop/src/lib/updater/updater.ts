import log from 'electron-log'
import { UpdateDownloadedEvent, autoUpdater } from 'electron-updater'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { getWindows } from 'desktopSrc/lib/window'
import { IpcOnEvent } from 'uiSrc/electron/constants'

export const updateDownloaded = (updateInfo: UpdateDownloadedEvent) => {
  setTimeout(() => {
    const [currentWindow] = getWindows().values()

    currentWindow?.webContents.send(IpcOnEvent.appUpdateAvailable, updateInfo)
  }, 60 * 1_000) // 1 min
}

export const checkForUpdate = async (url: string = '') => {
  if (!url || process.mas) {
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

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  const res = await autoUpdater.checkForUpdates()

  if (res?.downloadPromise) {
    await res.downloadPromise
  }
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
