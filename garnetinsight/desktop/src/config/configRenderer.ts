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
config.apiPort = process.env.RI_APP_PORT || configInit.defaultPort

export const configRenderer = config
