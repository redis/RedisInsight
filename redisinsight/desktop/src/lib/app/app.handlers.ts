import { app } from 'electron'
import log from 'electron-log'
import { getBackendGracefulShutdown } from 'desktopSrc/lib'
import {
  deepLinkHandler,
  deepLinkWindowHandler,
} from 'desktopSrc/lib/app/deep-link.handlers'
import { isTrustedCertHost } from 'desktopSrc/lib/app/trustedCertHost'
import { showOrCreateWindow } from 'desktopSrc/utils'

export const initAppHandlers = () => {
  app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    await showOrCreateWindow()
  })

  app.on(
    'certificate-error',
    (event, _webContents, url, _error, _certificate, callback) => {
      // Trust self-signed certificates only from the local backend; reject
      // certificate errors from any remote host to prevent interception.
      if (isTrustedCertHost(url)) {
        event.preventDefault()
        callback(true)
        return
      }

      log.warn(`Rejected certificate error for untrusted host: ${url}`)
      callback(false)
    },
  )

  app.on('window-all-closed', () => {
    log.info('window-all-closed')
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('continue-activity-error', (event, type, error) => {
    log.info('event', event)
    log.info('type', type)
    log.info('error', error)
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('quit', () => {
    try {
      getBackendGracefulShutdown?.()
    } catch (e) {
      // ignore any error
    }
  })

  // deep link open (win + linux)
  app.on('second-instance', async (_event, commandLine) => {
    await deepLinkWindowHandler(await deepLinkHandler(commandLine?.pop()))
  })
}
