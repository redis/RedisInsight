import { AuthStrategy } from './auth.interface'
import { TcpAuthStrategy } from './tcp.auth.strategy'
import { ServiceAuthStrategy } from './service.auth.strategy'

export const createAuthStrategy = (beApp?: any): AuthStrategy => {
  if (process.env.USE_TCP_CLOUD_AUTH === 'true') {
    return TcpAuthStrategy.getInstance()
  }
  return ServiceAuthStrategy.getInstance(beApp)
}
