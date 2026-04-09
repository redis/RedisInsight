import { app } from 'electron'
import log from 'electron-log'
import init from './app'

const gotTheLock =
  app.requestSingleInstanceLock() || process.platform === 'darwin'

// deep link open (win)
if (!gotTheLock) {
  // eslint-disable-next-line no-console
  console.log("Didn't get the lock. Quiting...")
  app.quit()
} else {
  init().catch((err) => {
    log.error('[Fatal] Application failed to initialize:', err)
    // eslint-disable-next-line no-console
    console.error('[Fatal] Application failed to initialize:', err)
    app.quit()
  })
}
