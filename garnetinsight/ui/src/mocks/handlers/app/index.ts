import { HttpHandler } from 'msw'

import info from './infoHandlers'
import telemetry from './telemetryHandlers'
import featureHandlers from './featureHandlers'

const handlers: HttpHandler[] = [...info, ...telemetry, ...featureHandlers]
export default handlers
