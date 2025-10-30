import { HttpHandler } from 'msw'
import assistant from 'uiSrc/mocks/handlers/ai/assistantHandlers'

const handlers: HttpHandler[] = [...assistant]
export default handlers
