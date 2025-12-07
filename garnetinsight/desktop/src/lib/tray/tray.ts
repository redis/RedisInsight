import {
  app,
  Menu,
  shell,
  Tray,
  nativeImage,
  MenuItemConstructorOptions,
} from 'electron'
import path from 'path'
import { getWindows } from 'desktopSrc/lib'
import { showOrCreateWindow } from 'desktopSrc/utils'
// eslint-disable-next-line import/no-cycle
import { setToQuiting } from './trayManager'

export class TrayBuilder {
  public tray: Tray

  constructor() {
    // eslint-disable-next-line operator-linebreak
    const iconName =
      process.platform === 'darwin'
        ? 'icon-tray-white.png'
        : 'icon-tray-colored.png'
    const iconPath = `${!app.isPackaged ? '../' : ''}../../../resources/`
    const iconFullPath = path.join(__dirname, iconPath, iconName)
    const icon = nativeImage.createFromPath(iconFullPath)
    const iconTray = icon.resize({ height: 16, width: 16 })

    this.tray = new Tray(iconTray)
  }

  buildOpenAppSubMenu() {
    if (getWindows()?.size > 1) {
      return {
        label: 'Open Garnet Insight',
        type: 'submenu',
        submenu: [
          {
            label: 'All',
            click: () => {
              this.openApp()
            },
          },
          {
            type: 'separator',
          },
          ...[...getWindows().values()].map((window) => ({
            label: window.webContents.getTitle(),
            click: () => {
              window.show()
            },
          })),
        ],
      }
    }

    return {
      label: 'Open Garnet Insight',
      click: () => {
        this.openApp()
      },
    }
  }

  buildContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      this.buildOpenAppSubMenu(),
      { type: 'separator' },
      {
        label: 'About',
        click: () => {
          this.openApp()

          app.showAboutPanel()
        },
      },
      {
        label: 'Learn More',
        click() {
          shell.openExternal(
            'https://redis.io/docs/ui/insight/?utm_source=garnetinsight&utm_medium=main&utm_campaign=learn_more',
          )
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          setToQuiting()
          app.quit()
        },
      },
    ] as MenuItemConstructorOptions[])

    this.tray.setContextMenu(contextMenu)
  }

  buildTray() {
    this.tray.setToolTip(app.name)
    this.buildContextMenu()

    if (process.platform !== 'darwin') {
      this.tray.on('click', () => {
        this.openApp()
      })
    }

    return this.tray
  }

  updateTooltip(name: string) {
    this.tray.setToolTip(name)
  }

  private async openApp() {
    await showOrCreateWindow()
  }
}
