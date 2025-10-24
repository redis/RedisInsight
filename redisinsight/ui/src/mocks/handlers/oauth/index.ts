import { HttpHandler } from 'msw'

import cloud from './cloud'

const handlers: HttpHandler[] = [...cloud]
export default handlers
