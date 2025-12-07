import log from 'electron-log'
import { configMain as config } from 'desktopSrc/config'

export const initLogging = () => {
  if (!config.isProduction) {
    log.transports.file.getFile().clear()
  }

  log.info('App starting.....')
}

export const logStoreStatus = (text: string) => {
  log.info(text)
}
