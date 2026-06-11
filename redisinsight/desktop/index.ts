import { app } from 'electron'
import log from 'electron-log'
import init from './app'

// Linux/snap rendering fallback.
// Under snap confinement the bundled GPU stack (the legacy gnome-3-28-1804
// platform) has no usable driver for modern GPUs, and newer Electron no longer
// silently falls back to software rendering — it dies at GPU/Wayland init
// ("Failed to initialize Wayland platform ... Exiting", or the GPU process
// exits and the window never renders). This regressed between v3.0.3 and
// v3.4.x. Force X11 and software GL so the window can still render.
// These switches must be set before the app becomes ready.
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('ozone-platform', 'x11')
  app.disableHardwareAcceleration()
  app.commandLine.appendSwitch('use-gl', 'swiftshader')
}

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
