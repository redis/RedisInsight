import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { handlers } from './handlers'

// Setup requests interception using the given handlers.
export const mswServer = setupServer(
  ...handlers,
  http.all(
    '*',
    jest.fn().mockImplementation(async ({ request }) => {
      console.warn(`[MSW] Unhandled request: ${request.method} ${request.url}`)
      return HttpResponse.json({}, { status: 200 })
    }),
  ),
)
