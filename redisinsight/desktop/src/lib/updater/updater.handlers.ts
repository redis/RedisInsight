import { app } from 'electron'
import { autoUpdater, UpdateDownloadedEvent } from 'electron-updater'
import log from 'electron-log'

import {
  electronStore,
  updateDownloaded,
  updateDownloadState,
  sendUpdateState,
  getUpdateStrategy,
  UNPROMPTED_NOTIFICATION_DELAY,
} from 'desktopSrc/lib'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { AppUpdateStatus, ElectronStorageItem } from 'uiSrc/electron/constants'

export const initAutoUpdaterHandlers = () => {
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...')
  })
  autoUpdater.on('update-available', (info) => {
    log.info('Update available.')
    electronStore?.set(ElectronStorageItem.isUpdateAvailable, true)

    if (autoUpdater.autoDownload) {
      return
    }

    setTimeout(() => {
      if (updateDownloadState.downloadedInfo?.version === info.version) {
        updateDownloaded(updateDownloadState.downloadedInfo)
        return
      }

      const skippedVersion = electronStore?.get(
        ElectronStorageItem.updateSkippedVersion,
      )

      if (
        skippedVersion === info.version ||
        updateDownloadState.isDownloading
      ) {
        return
      }

      sendUpdateState({
        status: AppUpdateStatus.Available,
        version: info.version,
      })
    }, UNPROMPTED_NOTIFICATION_DELAY)
  })
  autoUpdater.on('update-not-available', () => {
    log.info('Update not available.')
    electronStore?.set(ElectronStorageItem.isUpdateAvailable, false)
  })
  autoUpdater.on('error', (err: Error) => {
    log.info(`Error in auto-updater. ${wrapErrorMessageSensitiveData(err)}`)

    if (updateDownloadState.isDownloading) {
      updateDownloadState.isDownloading = false
      sendUpdateState({ status: AppUpdateStatus.Error })
    }
  })
  autoUpdater.on('download-progress', (progressObj: any) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`
    logMessage += ` - Downloaded ${progressObj.percent}%`
    logMessage += ` (${progressObj.transferred}/${progressObj.total})`
    log.info(logMessage)
  })
  autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent) => {
    log.info('Update downloaded')
    log.info('releaseNotes', info.releaseNotes)
    log.info('releaseDate', info.releaseDate)
    log.info('releaseName', info.releaseName)
    log.info('version', info.version)
    log.info('files', info.files)

    updateDownloadState.isDownloading = false
    updateDownloadState.downloadedInfo = info
    electronStore?.delete(ElectronStorageItem.updateSkippedVersion)

    // set updateDownloaded to electron storage for Telemetry send event APPLICATION_UPDATED
    electronStore?.set(ElectronStorageItem.updateDownloaded, true)
    electronStore?.set(ElectronStorageItem.updateDownloadedForTelemetry, true)
    electronStore?.set(
      ElectronStorageItem.updateDownloadedVersion,
      info.version,
    )
    electronStore?.set(
      ElectronStorageItem.updatePreviousVersion,
      app.getVersion(),
    )
    electronStore?.set(
      ElectronStorageItem.updateDownloadedStrategy,
      getUpdateStrategy(),
    )

    updateDownloaded(info)
  })
}
