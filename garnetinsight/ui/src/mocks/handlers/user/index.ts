import { HttpHandler } from 'msw'

import userSettings from './userSettingsHandlers'

const handlers: HttpHandler[] = [...userSettings]
export default handlers
