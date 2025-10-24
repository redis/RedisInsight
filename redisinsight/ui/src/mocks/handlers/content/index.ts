import { HttpHandler } from 'msw'
import crb from './createRedisButtonsHandlers'

const handlers: HttpHandler[] = [...crb]
export default handlers
