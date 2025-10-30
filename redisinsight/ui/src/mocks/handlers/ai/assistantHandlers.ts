import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

const handlers: HttpHandler[] = [
  http.get<{ id: string }>(
    getMswURL(`/${ApiEndpoints.AI_ASSISTANT_CHATS}/:id`),
    async ({ params }) => {
      const { id } = params

      return HttpResponse.json({ id, messages: [] }, { status: 200 })
    },
  ),
  http.post<{ id: string }, { content: string }>(
    getMswURL(`/${ApiEndpoints.AI_ASSISTANT_CHATS}/:id/messages`),
    async ({ request }) => {
      const { content } = await request.json()

      return HttpResponse.json([content], { status: 200 })
    },
  ),
  http.post<{ id: string }, { content: string }>(
    getMswURL(`/${ApiEndpoints.AI_ASSISTANT_CHATS}`),
    async ({ request }) => {
      const { content } = await request.json()

      return HttpResponse.json([content], { status: 200 })
    },
  ),
  http.delete<{ id: string }>(
    getMswURL(`/${ApiEndpoints.AI_ASSISTANT_CHATS}/:id`),
    async () => {
      return HttpResponse.text('', { status: 200 })
    },
  ),
  http.options(getMswURL(`/${ApiEndpoints.AI_ASSISTANT_CHATS}*`), () => {
    return new Response(null, {
      status: 200,
      headers: {
        Allow: 'GET,HEAD,POST,DELETE',
      },
    })
  }),
]

export default handlers
