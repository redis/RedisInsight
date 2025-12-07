import log from 'electron-log'
import { Socket } from 'net'
import { AuthStrategy } from './auth.interface'

export class TcpAuthStrategy implements AuthStrategy {
  private static instance: TcpAuthStrategy

  private initialized = false

  private readonly port = parseInt(
    process.env.TCP_LOCAL_CLOUD_AUTH_PORT || '5542',
    10,
  )

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): TcpAuthStrategy {
    if (!TcpAuthStrategy.instance) {
      TcpAuthStrategy.instance = new TcpAuthStrategy()
    }
    return TcpAuthStrategy.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    log.info('[TCP Auth] Initializing TCP auth strategy')

    this.initialized = true
  }

  // Add this method to handle window auth requests
  async checkWindowAuth(windowId: string): Promise<boolean> {
    log.info('[TCP Auth] Checking window auth via TCP:', windowId)
    const result = await this.sendTcpRequest('checkWindowAuth', { windowId })
    return result.isAuthorized
  }

  private async sendTcpRequest(action: string, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const client = new Socket()

      client.connect(this.port, 'localhost', () => {
        client.write(JSON.stringify({ action, options }))
      })

      client.on('data', (data) => {
        try {
          const response = JSON.parse(data.toString())
          resolve(response)
        } catch (err) {
          reject(err)
        }
        client.end()
      })
      client.on('error', (err) => {
        reject(err)
      })
    })
  }

  async getAuthUrl(options: any): Promise<{ url: string }> {
    log.info('[TCP Auth] Getting auth URL')
    const result = await this.sendTcpRequest('getAuthUrl', options)
    log.info('[TCP Auth] Auth URL obtained')
    return result
  }

  async handleCallback(query: any): Promise<any> {
    log.info('[TCP Auth] Handling callback')
    const result = await this.sendTcpRequest('handleCallback', { query })
    log.info('[TCP Auth] Callback handled')
    return result
  }

  async shutdown(): Promise<void> {
    log.info('[TCP Auth] Shutting down TCP auth server')
  }
}
