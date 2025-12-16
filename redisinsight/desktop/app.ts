/* eslint global-require: off, no-console: off */
import { app, nativeTheme } from 'electron'
import log from 'electron-log'
import path from 'path'
import {
  initElectronHandlers,
  initLogging,
  WindowType,
  windowFactory,
  AboutPanelOptions,
  initAutoUpdateChecks,
  installExtensions,
  initTray,
  initAutoUpdaterHandlers,
  launchApiServer,
  initCloudHandlers,
  initAzureHandlers,
  electronStore,
} from 'desktopSrc/lib'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'
import {
  deepLinkHandler,
  deepLinkWindowHandler,
} from 'desktopSrc/lib/app/deep-link.handlers'
import { ElectronStorageItem } from 'uiSrc/electron/constants'

if (!config.isProduction) {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

let deepLink: undefined | string

const init = async () => {
  await launchApiServer()
  initLogging()
  initElectronHandlers()
  initAutoUpdaterHandlers()
  initTray()
  initCloudHandlers()
  initAzureHandlers()

  nativeTheme.themeSource =
    electronStore?.get(ElectronStorageItem.themeSource) || config.themeSource

  app.setName(config.name)
  app.setAppUserModelId(config.name)
  app.setAboutPanelOptions(AboutPanelOptions)

  await installExtensions()

  try {
    await app.whenReady()

    deepLink = process.argv?.[1] || deepLink

    // deep linking
    // register our application to handle custom protocol
    if (process.defaultApp) {
      if (deepLink) {
        app.setAsDefaultProtocolClient(config.schema, process.execPath, [
          path.resolve(deepLink),
        ])
      }
    } else {
      app.setAsDefaultProtocolClient(config.schema)
    }

    const splashWindow = await windowFactory(WindowType.Splash)

    let parsedDeepLink

    if (deepLink) {
      parsedDeepLink = await deepLinkHandler(deepLink)
    }

    await windowFactory(WindowType.Main, splashWindow, { parsedDeepLink })

    if (process.env.RI_DISABLE_AUTO_UPGRADE !== 'true') {
      initAutoUpdateChecks(
        process.env.RI_MANUAL_UPGRADES_LINK || process.env.RI_UPGRADES_LINK,
        parseInt(process.env.RI_AUTO_UPDATE_INTERVAL ?? '', 10) ||
          84 * 3600 * 1000,
      )
    }
  } catch (err) {
    log.error(wrapErrorMessageSensitiveData(err as Error))
  }
}

// deep link open (darwin)
// if app is not ready then we store url and continue in init function
app.on('open-url', async (event, url) => {
  event.preventDefault()

  deepLink = url
  if (app.isReady()) {
    await deepLinkWindowHandler(await deepLinkHandler(url))
  }
})

export default init
