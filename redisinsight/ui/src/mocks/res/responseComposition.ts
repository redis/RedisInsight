import { http, HttpResponse } from 'msw'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'

export const errorHandlers = [
  http.all('*', () => {
    return HttpResponse.json(
      { message: DEFAULT_ERROR_MESSAGE },
      { status: 500 },
    )
  }),
]
