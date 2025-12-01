import { app } from 'electron'
import path from 'path'
import { configMain as config } from 'desktopSrc/config'

const ICON_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources', 'icon.png')
  : path.join(__dirname, '../resources', 'icon.png')

const appVersionPrefix = config.isEnterprise ? 'Enterprise - ' : ''
const appVersion = app.getVersion() || '2.69.10'
const appVersionSuffix = !config.isProduction
  ? `-dev-${process.getCreationTime()}`
  : ''

export const AboutPanelOptions = {
  applicationName: 'Redis Insight',
  applicationVersion: `${appVersionPrefix}${appVersion}${appVersionSuffix}`,
  copyright: `Copyright © ${new Date().getFullYear()} Redis Ltd.`,
  iconPath: ICON_PATH,
}
