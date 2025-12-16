enum IpcInvokeEvent {
  getStoreValue = 'store:get:value',
  deleteStoreValue = 'store:delete:value',
  getAppVersion = 'app:get:version',
  cloudOauth = 'cloud:oauth',
  azureOauth = 'azure:oauth',
  windowOpen = 'window:open',
  themeChange = 'theme:change',
  appRestart = 'app:restart',
}

enum IpcOnEvent {
  sendWindowId = 'window:send:id',
  cloudOauthCallback = 'cloud:oauth:callback',
  azureOauthCallback = 'azure:oauth:callback',
  deepLinkAction = 'deep-link:action',
  appUpdateAvailable = 'app:update:available',
}

export { IpcInvokeEvent, IpcOnEvent }
