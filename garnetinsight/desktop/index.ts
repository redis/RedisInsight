import { app } from 'electron'
import init from './app'

const gotTheLock =
  app.requestSingleInstanceLock() || process.platform === 'darwin'

// deep link open (win)
if (!gotTheLock) {
  // eslint-disable-next-line no-console
  console.log("Didn't get the lock. Quiting...")
  app.quit()
} else {
  init()
}
