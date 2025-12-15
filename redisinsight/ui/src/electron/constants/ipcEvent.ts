enum IpcInvokeEvent {
  getStoreValue = 'store:get:value',
  deleteStoreValue = 'store:delete:value',
  getAppVersion = 'app:get:version',
  cloudOauth = 'cloud:oauth',
  azureSsoOauth = 'azure:sso:oauth',
  azureSsoRefreshToken = 'azure:sso:refresh-token',
  azureSsoGetRedisToken = 'azure:sso:get-redis-token',
  azureSsoLogout = 'azure:sso:logout',
  windowOpen = 'window:open',
  themeChange = 'theme:change',
  appRestart = 'app:restart',
}

enum IpcOnEvent {
  sendWindowId = 'window:send:id',
  cloudOauthCallback = 'cloud:oauth:callback',
  azureSsoOauthCallback = 'azure:sso:oauth:callback',
  deepLinkAction = 'deep-link:action',
  appUpdateAvailable = 'app:update:available',
}

export { IpcInvokeEvent, IpcOnEvent }
