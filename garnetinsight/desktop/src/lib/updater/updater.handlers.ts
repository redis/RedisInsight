import { app } from 'electron'
import { autoUpdater, UpdateDownloadedEvent } from 'electron-updater'
import log from 'electron-log'

import { electronStore, updateDownloaded } from 'desktopSrc/lib'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { ElectronStorageItem } from 'uiSrc/electron/constants'

export const initAutoUpdaterHandlers = () => {
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...')
  })
  autoUpdater.on('update-available', () => {
    log.info('Update available.')
    electronStore?.set(ElectronStorageItem.isUpdateAvailable, true)
  })
  autoUpdater.on('update-not-available', () => {
    log.info('Update not available.')
    electronStore?.set(ElectronStorageItem.isUpdateAvailable, false)
  })
  autoUpdater.on('error', (err: Error) => {
    log.info(`Error in auto-updater. ${wrapErrorMessageSensitiveData(err)}`)
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

    updateDownloaded(info)
  })
}
