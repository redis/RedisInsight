import log from 'electron-log'
import getPort, { portNumbers } from 'get-port'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'
import { createAuthStrategy } from 'desktopSrc/lib/auth/auth.factory'
import { AuthStrategy } from 'desktopSrc/lib/auth/auth.interface'
import { initAzureAuthServiceProvider } from 'desktopSrc/lib/azure'
import { AbstractWindowAuthStrategy } from 'apiSrc/modules/auth/window-auth/strategies/abstract.window.auth.strategy'
// eslint-disable-next-line import/extensions -- api/dist doesn't exist in CI
import { WindowAuthModule } from '../../../../api/dist/src/modules/auth/window-auth/window-auth.module'
// eslint-disable-next-line import/extensions -- api/dist doesn't exist in CI
import { WindowAuthService } from '../../../../api/dist/src/modules/auth/window-auth/window-auth.service'
// eslint-disable-next-line import/extensions -- api/dist doesn't exist in CI
import server from '../../../../api/dist/src/main'
import { getWindows } from '../window'

const port = config?.defaultPort
let gracefulShutdown: Function
let beApp: any

export class ElectronWindowAuthStrategy extends AbstractWindowAuthStrategy {
  async isAuthorized(id: string): Promise<boolean> {
    return getWindows()?.has(id)
  }
}

// Create auth strategy after beApp is initialized
let authStrategy: AuthStrategy

export const launchApiServer = async () => {
  try {
    log.info('[Server] Launching API server')

    if (!config.isDevelopment) {
      // Production code
      const detectPortConst = await getPort({
        port: portNumbers(port, port + 1_000),
      })
      process.env.RI_APP_PORT = detectPortConst?.toString()

      if (process.env.APPIMAGE) {
        process.env.BUILD_PACKAGE = 'appimage'
      }
      log.info(
        '[Server] Starting production server with port:',
        detectPortConst,
      )
      log.info('[Server] Environment:', process.env.NODE_ENV)

      const { gracefulShutdown: gracefulShutdownFn, app: apiApp } =
        await server(detectPortConst)
      gracefulShutdown = gracefulShutdownFn
      beApp = apiApp

      // Get the WindowAuthService directly from the app
      const winAuthService = beApp
        ?.select?.(WindowAuthModule)
        .get?.(WindowAuthService)
      winAuthService.setStrategy(new ElectronWindowAuthStrategy())

      // Pass the service instance to the auth strategy
      authStrategy = createAuthStrategy(apiApp)
      await authStrategy.initialize()

      // Initialize Azure auth service provider
      initAzureAuthServiceProvider(apiApp)

      log.info('[Server] Production server initialized')
    } else {
      authStrategy = createAuthStrategy()
      await authStrategy.initialize()
    }
  } catch (_err) {
    const error = _err as Error
    log.error(
      '[Server] Catch server error:',
      wrapErrorMessageSensitiveData(error),
    )
    log.error('[Server] Server initialization error:', error)
    log.error('[Server] Error stack:', error.stack)
    throw error
  }
}

export const getBackendGracefulShutdown = () => {
  log.info('[Server] Initiating graceful shutdown')
  return gracefulShutdown?.()
}

export const getBackendApp = () => {
  log.info('[Server] Getting backend app')
  return beApp
}
