import log from 'electron-log'
import { AzureAuthService } from '../../../../api/dist/src/modules/azure/auth/azure-auth.service'
import { AzureModule } from '../../../../api/dist/src/modules/azure/azure.module'

let azureAuthService: AzureAuthService | null = null
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
 */
export const getAzureAuthService = (): AzureAuthService | null => {
  if (azureAuthService) {
    return azureAuthService
  }

  if (!beApp) {
    log.warn('[Azure Auth] Backend app not initialized')
    return null
  }

  try {
    azureAuthService = beApp.select(AzureModule).get(AzureAuthService)
    log.info('[Azure Auth] Service obtained from backend app')
    return azureAuthService
  } catch (err) {
    log.error('[Azure Auth] Failed to get service from backend app:', err)
    return null
  }
}
