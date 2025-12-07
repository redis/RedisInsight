import { HttpHandler } from 'msw'

import rdiHandler from './rdiHandler'
import rdiStrategiesHandler from './rdiPipelineStrategiesHandlers'

// @ts-ignore
const handlers: HttpHandler[] = [...rdiHandler, ...rdiStrategiesHandler]
export default handlers
