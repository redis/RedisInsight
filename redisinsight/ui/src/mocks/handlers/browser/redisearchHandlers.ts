import { http, HttpHandler, HttpResponse } from 'msw'
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

const handlers: HttpHandler[] = [
  // fetchRedisearchListAction
  http.get<any, ListRedisearchIndexesResponse>(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH)),
    async () => {
      HttpResponse.json(REDISEARCH_LIST_DATA_MOCK, { status: 200 })
    },
  ),
  http.post<any, IndexInfoDto>(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH_INFO)),
    async () => {
      HttpResponse.json(indexInfoFactory.build(), { status: 200 })
    },
  ),
  http.delete(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.REDISEARCH)),
    async () => {
      HttpResponse.text('', { status: 204 })
    },
  ),
]

export default handlers
