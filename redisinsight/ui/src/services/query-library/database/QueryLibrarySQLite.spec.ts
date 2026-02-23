import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'

import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { mswServer } from 'uiSrc/mocks/server'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import {
  queryLibraryItemFactory,
  createQueryLibraryItemFactory,
  seedQueryLibraryItemFactory,
} from 'uiSrc/mocks/factories/query-library/queryLibraryItem.factory'

import { QueryLibrarySQLite } from './QueryLibrarySQLite'

describe('QueryLibrarySQLite', () => {
  let sqlite: QueryLibrarySQLite
  const instanceId = INSTANCE_ID_MOCK
  const mockIndexName = `idx:${faker.word.noun()}`

  beforeEach(() => {
    jest.clearAllMocks()
    sqlite = new QueryLibrarySQLite()
  })

  describe('getList', () => {
    it('should return items on successful response', async () => {
      const mockItems = queryLibraryItemFactory.buildList(3)

      mswServer.use(
        http.get(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY)),
          async () => HttpResponse.json(mockItems, { status: 200 }),
        ),
      )

      const result = await sqlite.getList(instanceId, {
        indexName: mockIndexName,
      })

      expect(result).toEqual({ success: true, data: mockItems })
    })

    it('should handle 400 error', async () => {
      const statusCode = 400

      mswServer.use(
        http.get(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY)),
          async () => HttpResponse.text('', { status: statusCode }),
        ),
      )

      const result = await sqlite.getList(instanceId, {
        indexName: mockIndexName,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe(
        `Request failed with status code ${statusCode}`,
      )
    })

    it('should handle network errors', async () => {
      mswServer.use(
        http.get(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY)),
          async () => HttpResponse.error(),
        ),
      )

      const result = await sqlite.getList(instanceId, {
        indexName: mockIndexName,
      })

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Network Error')
    })
  })

  describe('getOne', () => {
    it('should return item on successful response', async () => {
      const mockItem = queryLibraryItemFactory.build()

      mswServer.use(
        http.get(
          getMswURL(
            getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, mockItem.id),
          ),
          async () => HttpResponse.json(mockItem, { status: 200 }),
        ),
      )

      const result = await sqlite.getOne(instanceId, mockItem.id)

      expect(result).toEqual({ success: true, data: mockItem })
    })

    it('should handle 404 error', async () => {
      const statusCode = 404
      const itemId = faker.string.uuid()

      mswServer.use(
        http.get(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, itemId)),
          async () => HttpResponse.text('', { status: statusCode }),
        ),
      )

      const result = await sqlite.getOne(instanceId, itemId)

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
    })

    it('should handle network errors', async () => {
      const itemId = faker.string.uuid()

      mswServer.use(
        http.get(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, itemId)),
          async () => HttpResponse.error(),
        ),
      )

      const result = await sqlite.getOne(instanceId, itemId)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Network Error')
    })
  })

  describe('create', () => {
    it('should return created item on success', async () => {
      const mockItem = queryLibraryItemFactory.build()

      mswServer.use(
        http.post(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY)),
          async () => HttpResponse.json(mockItem, { status: 201 }),
        ),
      )

      const result = await sqlite.create(instanceId, {
        indexName: mockItem.indexName,
        name: mockItem.name,
        query: mockItem.query,
      })

      expect(result).toEqual({ success: true, data: mockItem })
    })

    it('should handle 400 error', async () => {
      const statusCode = 400

      mswServer.use(
        http.post(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY)),
          async () => HttpResponse.text('', { status: statusCode }),
        ),
      )

      const result = await sqlite.create(
        instanceId,
        createQueryLibraryItemFactory.build(),
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
    })

    it('should handle network errors', async () => {
      mswServer.use(
        http.post(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY)),
          async () => HttpResponse.error(),
        ),
      )

      const result = await sqlite.create(
        instanceId,
        createQueryLibraryItemFactory.build(),
      )

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Network Error')
    })
  })

  describe('update', () => {
    it('should return updated item on success', async () => {
      const mockItem = queryLibraryItemFactory.build()

      mswServer.use(
        http.patch(
          getMswURL(
            getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, mockItem.id),
          ),
          async () => HttpResponse.json(mockItem, { status: 200 }),
        ),
      )

      const result = await sqlite.update(instanceId, mockItem.id, {
        name: mockItem.name,
      })

      expect(result).toEqual({ success: true, data: mockItem })
    })

    it('should handle 400 error', async () => {
      const statusCode = 400
      const itemId = faker.string.uuid()

      mswServer.use(
        http.patch(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, itemId)),
          async () => HttpResponse.text('', { status: statusCode }),
        ),
      )

      const result = await sqlite.update(instanceId, itemId, {
        name: faker.lorem.words(2),
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
    })

    it('should handle network errors', async () => {
      const itemId = faker.string.uuid()

      mswServer.use(
        http.patch(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, itemId)),
          async () => HttpResponse.error(),
        ),
      )

      const result = await sqlite.update(instanceId, itemId, {
        name: faker.lorem.words(2),
      })

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Network Error')
    })
  })

  describe('delete', () => {
    it('should return success on successful delete', async () => {
      const itemId = faker.string.uuid()

      mswServer.use(
        http.delete(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, itemId)),
          async () => HttpResponse.text('', { status: 200 }),
        ),
      )

      const result = await sqlite.delete(instanceId, itemId)

      expect(result).toEqual({ success: true })
    })

    it('should handle 400 error', async () => {
      const statusCode = 400
      const itemId = faker.string.uuid()

      mswServer.use(
        http.delete(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, itemId)),
          async () => HttpResponse.text('', { status: statusCode }),
        ),
      )

      const result = await sqlite.delete(instanceId, itemId)

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
    })

    it('should handle network errors', async () => {
      const itemId = faker.string.uuid()

      mswServer.use(
        http.delete(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY, itemId)),
          async () => HttpResponse.error(),
        ),
      )

      const result = await sqlite.delete(instanceId, itemId)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Network Error')
    })
  })

  describe('seed', () => {
    const seedInput = seedQueryLibraryItemFactory.buildList(2)

    it('should return seeded items on success', async () => {
      const mockItems = queryLibraryItemFactory.buildList(2)

      mswServer.use(
        http.post(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY_SEED)),
          async () => HttpResponse.json(mockItems, { status: 201 }),
        ),
      )

      const result = await sqlite.seed(instanceId, seedInput)

      expect(result).toEqual({ success: true, data: mockItems })
    })

    it('should handle 400 error', async () => {
      const statusCode = 400

      mswServer.use(
        http.post(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY_SEED)),
          async () => HttpResponse.text('', { status: statusCode }),
        ),
      )

      const result = await sqlite.seed(instanceId, seedInput)

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
    })

    it('should handle network errors', async () => {
      mswServer.use(
        http.post(
          getMswURL(getUrl(instanceId, ApiEndpoints.QUERY_LIBRARY_SEED)),
          async () => HttpResponse.error(),
        ),
      )

      const result = await sqlite.seed(instanceId, seedInput)

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Network Error')
    })
  })

})
