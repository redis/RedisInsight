import { BrowserWindow, Tray } from 'electron'
import { electronStore } from 'desktopSrc/lib'
import { ElectronStorageItem } from 'uiSrc/electron/constants'
// eslint-disable-next-line import/no-cycle
import { TrayBuilder } from './tray'

let tray: TrayBuilder
let trayInstance: Tray

export const updateDisplayAppInTray = (value: boolean) => {
  electronStore?.set(ElectronStorageItem.isDisplayAppInTray, value)
  if (!value) {
    trayInstance?.destroy()
    return
  }
  tray = new TrayBuilder()
  trayInstance = tray.buildTray()

  const currentWindow = BrowserWindow.getFocusedWindow()
  if (currentWindow) {
    tray.updateTooltip(currentWindow.webContents.getTitle())
  }
}

export const getDisplayAppInTrayValue = (): boolean => {
  if (process.platform === 'linux') {
    return false
  }
  return !!electronStore?.get(ElectronStorageItem.isDisplayAppInTray)
}

export const initTray = () => {
  if (getDisplayAppInTrayValue()) {
    tray = new TrayBuilder()
    trayInstance = tray.buildTray()
  }
}

export const updateTray = (title: string = '') => {
  if (!trayInstance?.isDestroyed()) {
    tray?.buildContextMenu()
    tray?.updateTooltip(title)
  }
}

let IS_QUITING = false
export const getIsQuiting = () => IS_QUITING
export const setToQuiting = () => {
  IS_QUITING = true
}

export const getTray = () => tray
export const getTrayInstance = () => trayInstance
