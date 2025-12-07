import { HttpHandler } from 'msw'

import instances from './instancesHandlers'
import caCerts from './caCertsHandlers'

const handlers: HttpHandler[] = [...instances, ...caCerts]
export default handlers
