import log from 'electron-log'

let azureAuthService: any = null
let beApp: any = null

/**
 * Initialize the Azure auth service provider with the backend app instance.
 * This should be called after the NestJS app is bootstrapped.
 */
export const initAzureAuthServiceProvider = (app: any): void => {
  beApp = app
  log.info('[Azure Auth] Service provider initialized with backend app')
}

/**
 * Get the AzureAuthService instance from the backend app.
 * Lazily initializes the service on first call.
 *
 * Uses dynamic require to avoid loading api/dist modules at startup
 * (before the API is built).
 */
export const getAzureAuthService = (): any => {
  if (azureAuthService) {
    return azureAuthService
  }

  if (!beApp) {
    log.warn('[Azure Auth] Backend app not initialized')
    return null
  }

  try {
    // Dynamic require to avoid loading at module initialization time
    // eslint-disable-next-line global-require, import/extensions
    const {
      AzureAuthModule,
    } = require('../../../../api/dist/src/modules/azure/auth/azure-auth.module')
    // eslint-disable-next-line global-require, import/extensions
    const {
      AzureAuthService,
    } = require('../../../../api/dist/src/modules/azure/auth/azure-auth.service')

    azureAuthService = beApp.select(AzureAuthModule).get(AzureAuthService)
    log.info('[Azure Auth] Service obtained from backend app')
    return azureAuthService
  } catch (err) {
    log.error('[Azure Auth] Failed to get service from backend app:', err)
    return null
  }
}
