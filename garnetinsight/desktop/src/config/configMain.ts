import { app } from 'electron'
import path from 'path'
import { getAssetPath } from 'desktopSrc/utils'
import configInit from '../../config.json'
import pkg from '../../../package.json'

const config: any = configInit

// Merge in some details from package.json
config.defaultPort =
  process.env.NODE_ENV === 'development' ? 5540 : config.defaultPort
config.name = pkg.appName
config.description = pkg.description
config.version = pkg.version
config.author = pkg.author
config.isDevelopment = process.env.NODE_ENV === 'development'
config.isProduction = process.env.NODE_ENV === 'production'
config.appPort = process.env.RI_APP_PORT || configInit.defaultPort
config.appType = process.env.RI_APP_TYPE || 'ELECTRON'
config.isEnterprise = config.appType === 'ELECTRON_ENTERPRISE'
config.getApiPort = () => process.env.RI_APP_PORT || configInit.defaultPort
config.tcpLocalAuthPort = process.env.TCP_LOCAL_AUTH_PORT
  ? parseInt(process.env.TCP_LOCAL_AUTH_PORT, 10)
  : 5541

config.icon = getAssetPath('icon.png')

config.preloadPath = app.isPackaged
  ? path.join(__dirname, 'preload.js')
  : path.join(__dirname, '../../../dist/preload.js')

export const configMain = config
