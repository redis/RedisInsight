import { HttpHandler } from 'msw'

import commands from './commands'

const handlers: HttpHandler[] = [...commands]
export default handlers
