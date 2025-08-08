import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import commands from './commands'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(
  commands,
)
export default handlers
