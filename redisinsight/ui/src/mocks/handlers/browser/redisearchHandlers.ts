import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl, stringToBuffer } from 'uiSrc/utils'
import { indexInfoFactory } from 'uiSrc/mocks/factories/redisearch/IndexInfo.factory'
import {
  IndexInfoDto,
  ListRedisearchIndexesResponse,
} from 'apiSrc/modules/browser/redisearch/dto'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

export const REDISEARCH_LIST_DATA_MOCK_UTF8 = ['idx: 1', 'idx:2']
export const REDISEARCH_LIST_DATA_MOCK = {
  indexes: [...REDISEARCH_LIST_DATA_MOCK_UTF8].map((str) =>
    stringToBuffer(str),
  ),
}

const handlers: RestHandler[] = [
  // fetchRedisearchListAction
  rest.get<ListRedisearchIndexesResponse>(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH)),
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(REDISEARCH_LIST_DATA_MOCK)),
  ),
  rest.post<IndexInfoDto>(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH_INFO)),
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(indexInfoFactory.build())),
  ),
  rest.delete(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH)),
    async (_req, res, ctx) => res(ctx.status(204)),
  ),
]

export default handlers
