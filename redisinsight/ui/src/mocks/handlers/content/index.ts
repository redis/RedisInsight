import { MockedRequest, RestHandler } from 'msw'

import crb from './createRedisButtonsHandlers'

const handlers: RestHandler<MockedRequest>[] = [].concat(crb)
export default handlers
