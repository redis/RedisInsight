import { HttpHandler } from 'msw'

import tutorials from './tutorialsHandlers'

// @ts-ignore
const handlers: HttpHandler[] = [...tutorials]
export default handlers
