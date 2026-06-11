enum ElectronStorageItem {
  updateDownloaded = 'updateDownloaded',
  updateDownloadedForTelemetry = 'updateDownloadedForTelemetry',
  updateDownloadedVersion = 'updateDownloadedVersion',
  isUpdateAvailable = 'isUpdateAvailable',
  isDisplayAppInTray = 'isDisplayAppInTray',
  updatePreviousVersion = 'updatePreviousVersion',
  zoomFactor = 'zoomFactor',
  themeSource = 'themeSource',
  bounds = 'bounds',
  // Cached analytics consent so the main process can pick the Sentry tier
  // synchronously at boot, before the agreements DB is available.
  analyticsConsent = 'analyticsConsent',
}

export default ElectronStorageItem
