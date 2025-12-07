import contextMenu from 'electron-context-menu'
import { BrowserWindow, Rectangle } from 'electron'
import { v4 as uuidv4 } from 'uuid'

import { IParsedDeepLink } from 'desktopSrc/lib/app/deep-link.handlers'
import { configMain as config } from 'desktopSrc/config'
import { electronStore, updateTray } from 'desktopSrc/lib'
import { resolveHtmlPath, getFittedBounds } from 'desktopSrc/utils'
import { ElectronStorageItem } from 'uiSrc/electron/constants'
import { initWindowHandlers } from './window.handlers'

export const windows = new Map<string, BrowserWindow>()
export const getWindows = () => windows
export const focusWindow = (win: BrowserWindow) => {
  if (win.isMinimized()) win.restore()
  win.focus()
}
export const NEW_WINDOW_OFFSET = 24

export enum WindowType {
  Splash = 'splash',
  Main = 'main',
}

export interface ICreateWindow {
  prevWindow: BrowserWindow | null
  htmlFileName: string
  id?: string
  windowType: WindowType
  options: any
}

export const createWindow = async ({
  prevWindow = null,
  htmlFileName = '',
  windowType = WindowType.Main,
  id = uuidv4(),
  options = {},
}: ICreateWindow) => {
  let x
  let y
  let { width, height } = options

  const currentWindow = BrowserWindow.getFocusedWindow()
  const isNewMainWindow =
    currentWindow && currentWindow?.getTitle() !== config.splashWindow.title

  if (isNewMainWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition()
    const [currentWindowWidth, currentWindowHeight] = currentWindow?.getSize()
    x = currentWindowX + NEW_WINDOW_OFFSET
    y = currentWindowY + NEW_WINDOW_OFFSET
    width = currentWindowWidth
    height = currentWindowHeight
  }

  const newWindow: BrowserWindow | null = new BrowserWindow({
    ...options,
    x,
    y,
    width,
    height,
    webPreferences: {
      ...options.webPreferences,
      preload: options.preloadPath,
    },
  })

  if (windowType !== WindowType.Main) {
    await newWindow.loadURL(resolveHtmlPath(htmlFileName))
    return newWindow
  }

  const savedBounds = electronStore?.get(ElectronStorageItem.bounds)
  if (!isNewMainWindow && savedBounds) {
    const bounds = getFittedBounds(savedBounds as Rectangle)
    if (bounds) {
      newWindow.setBounds(bounds)
    }
  }

  if (config.isDevelopment) {
    newWindow.loadURL('http://localhost:8080')
  } else {
    newWindow.loadURL(resolveHtmlPath(htmlFileName, options?.parsedDeepLink))
  }

  initWindowHandlers(newWindow, prevWindow, windows, id)

  contextMenu({ window: newWindow, showInspectElement: true })

  windows.set(id, newWindow)

  updateTray(newWindow.webContents.getTitle())

  return newWindow
}

export const windowFactory = async (
  windowType: WindowType,
  prevWindow: BrowserWindow | null = null,
  options?: { parsedDeepLink?: IParsedDeepLink },
): Promise<BrowserWindow> => {
  switch (windowType) {
    case WindowType.Splash:
      return createWindow({
        prevWindow,
        htmlFileName: config.isDevelopment
          ? '../../../splash.html'
          : 'splash.html',
        windowType,
        options: {
          ...config.splashWindow,
          preloadPath: config.preloadPath,
        },
      })
    case WindowType.Main:
      return createWindow({
        prevWindow,
        htmlFileName: config.isDevelopment ? '../src/index.html' : 'index.html',
        windowType,
        options: {
          ...options,
          ...config.mainWindow,
          preloadPath: config.preloadPath,
        },
      })

    default:
      break
  }

  throw Error(`${windowType} is not supported`)
}
