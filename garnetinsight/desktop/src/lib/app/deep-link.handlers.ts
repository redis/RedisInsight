import log from 'electron-log'
import { parse } from 'url'
import {
  cloudDeepLinkHandler,
  focusWindow,
  getWindows,
  windowFactory,
  WindowType,
} from 'desktopSrc/lib'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { IpcOnEvent } from 'uiSrc/electron/constants'

export interface IParsedDeepLink {
  initialPage?: string
  target?: string
  from?: string
}

export const deepLinkHandler = async (
  from?: string,
): Promise<undefined | IParsedDeepLink> => {
  if (from) {
    try {
      const url = parse(from, true)
      switch (url?.hostname) {
        case 'cloud':
          await cloudDeepLinkHandler(url)
          break
        default:
          return {
            from,
            target: url.query?.target || '_self',
            initialPage: url.query?.initialPage,
          } as IParsedDeepLink
      }
    } catch (e) {
      log.error(wrapErrorMessageSensitiveData(e as Error))
    }
  }

  return undefined
}

export const deepLinkWindowHandler = async (
  parsedDeepLink?: IParsedDeepLink,
) => {
  // tbd: implement mechanism to find current window
  const [currentWindow] = getWindows().values()

  if (parsedDeepLink) {
    if (parsedDeepLink?.target === '_blank') {
      await windowFactory(WindowType.Main, null, { parsedDeepLink })
    } else if (currentWindow) {
      currentWindow?.show()
      currentWindow?.webContents.send(IpcOnEvent.deepLinkAction, parsedDeepLink)
      focusWindow(currentWindow)
    } else {
      await windowFactory(WindowType.Main, null, { parsedDeepLink })
    }
  } else if (currentWindow) {
    focusWindow(currentWindow)
  }
}
