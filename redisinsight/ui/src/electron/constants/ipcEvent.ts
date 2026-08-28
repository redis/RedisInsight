enum IpcInvokeEvent {
  getStoreValue = 'store:get:value',
  deleteStoreValue = 'store:delete:value',
  getAppVersion = 'app:get:version',
  cloudOauth = 'cloud:oauth',
  windowOpen = 'window:open',
  themeChange = 'theme:change',
  appRestart = 'app:restart',
  setSentryConsent = 'sentry:set:consent',
  setSentryInstallationId = 'sentry:set:installation-id',
  getUpdateStrategy = 'app:update:strategy:get',
  setUpdateStrategy = 'app:update:strategy:set',
  appUpdateDownload = 'app:update:download',
  skipUpdateVersion = 'app:update:skip',
  checkForUpdate = 'app:update:check',
}

enum IpcOnEvent {
  sendWindowId = 'window:send:id',
  cloudOauthCallback = 'cloud:oauth:callback',
  azureOauthCallback = 'azure:oauth:callback',
  deepLinkAction = 'deep-link:action',
  appUpdateAvailable = 'app:update:available',
  appUpdateState = 'app:update:state',
}

export { IpcInvokeEvent, IpcOnEvent }
