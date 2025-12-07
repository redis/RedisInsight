import log from 'electron-log'
import { AuthStrategy } from './auth.interface'
import { CloudAuthService } from '../../../../api/dist/src/modules/cloud/auth/cloud-auth.service'
import { CloudAuthModule } from '../../../../api/dist/src/modules/cloud/auth/cloud-auth.module'

export class ServiceAuthStrategy implements AuthStrategy {
  private static instance: ServiceAuthStrategy

  private cloudAuthService!: CloudAuthService

  private initialized = false

  private beApp: any

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(beApp?: any): ServiceAuthStrategy {
    if (!ServiceAuthStrategy.instance) {
      ServiceAuthStrategy.instance = new ServiceAuthStrategy()
    }
    if (beApp) {
      ServiceAuthStrategy.instance.beApp = beApp
    }
    return ServiceAuthStrategy.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      log.info('[Service Auth] Already initialized')
      return
    }

    log.info('[Service Auth] Initializing service auth')
    try {
      if (!this.beApp) {
        throw new Error('[Service Auth] Backend app not provided')
      }

      this.cloudAuthService = this.beApp
        .select(CloudAuthModule)
        .get(CloudAuthService)
      this.initialized = true
      log.info('[Service Auth] Service auth initialized')
    } catch (err) {
      log.error('[Service Auth] Initialization failed:', err)
      throw err
    }
  }

  async getAuthUrl(options: any): Promise<{ url: string }> {
    log.info('[Service Auth] Getting auth URL')
    const url = await this.cloudAuthService.getAuthorizationUrl(
      options.sessionMetadata,
      options.authOptions,
    )
    log.info('[Service Auth] Auth URL obtained')
    return { url }
  }

  async handleCallback(query: any): Promise<any> {
    log.info('[Service Auth] Handling callback')
    if (this.cloudAuthService.isRequestInProgress(query)) {
      log.info('[Service Auth] Request already in progress, skipping')
      return { status: 'succeed' }
    }
    const result = await this.cloudAuthService.handleCallback(query)
    log.info('[Service Auth] Callback handled')
    return result
  }

  async shutdown(): Promise<void> {
    log.info('[Service Auth] Shutting down service auth')
  }
}
