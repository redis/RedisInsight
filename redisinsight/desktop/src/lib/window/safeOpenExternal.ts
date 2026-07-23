import { shell } from 'electron'
import log from 'electron-log'
import { isSafeExternalUrl } from 'desktopSrc/lib/window/isSafeExternalUrl'

// Opens a URL in the user's default handler only when its scheme is allowlisted.
// Renderer content (tutorials, Copilot responses) can trigger window.open, so
// unrestricted shell.openExternal turns arbitrary renderer execution into local
// code execution.
export const openExternalSafe = (url: unknown): void => {
  if (isSafeExternalUrl(url)) {
    shell.openExternal(url)
    return
  }

  log.warn(`Blocked openExternal for disallowed URL: ${String(url)}`)
}
