import { faker } from '@faker-js/faker'

import {
  QueryLibraryType,
  QueryLibraryItem,
} from 'uiSrc/services/query-library/types'
import {
  queryLibraryItemFactory,
  createQueryLibraryItemFactory,
  seedQueryLibraryItemFactory,
} from 'uiSrc/mocks/factories/query-library/queryLibraryItem.factory'

import { queryLibraryStorage } from './QueryLibraryStorage'
import { QueryLibraryIndexedDB } from './QueryLibraryIndexedDB'

jest.mock('./QueryLibraryStorage', () => ({
  queryLibraryStorage: {
    getAllByIndex: jest.fn(),
    getById: jest.fn(),
    put: jest.fn(),
    remove: jest.fn(),
  },
}))

const mockedStorage = jest.mocked(queryLibraryStorage)

describe('QueryLibraryIndexedDB', () => {
  let indexedDB: QueryLibraryIndexedDB
  const mockDatabaseId = faker.string.uuid()
  const mockIndexName = `idx:${faker.word.noun()}`

  beforeEach(() => {
    jest.clearAllMocks()
    indexedDB = new QueryLibraryIndexedDB()
  })

  describe('getList', () => {
    it('should return items from storage', async () => {
      const mockItems = queryLibraryItemFactory.buildList(3, {
        databaseId: mockDatabaseId,
        indexName: mockIndexName,
      })
      mockedStorage.getAllByIndex.mockResolvedValue(mockItems)

      const result = await indexedDB.getList(mockDatabaseId, {
        indexName: mockIndexName,
      })

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(3)
      expect(mockedStorage.getAllByIndex).toHaveBeenCalledWith(
        mockDatabaseId,
        mockIndexName,
      )
    })

    it('should filter items by search term across name, description, and query fields', async () => {
      const items: QueryLibraryItem[] = [
        queryLibraryItemFactory.build({
          name: 'Find all bikes',
          description: '',
          query: '',
        }),
        queryLibraryItemFactory.build({
          name: '',
          description: 'bikes query',
          query: '',
        }),
        queryLibraryItemFactory.build({
          name: '',
          description: '',
          query: 'FT.SEARCH bikes "*"',
        }),
        queryLibraryItemFactory.build({
          name: 'Count documents',
          description: 'unrelated',
          query: 'FT.SEARCH products "*"',
        }),
      ]
      mockedStorage.getAllByIndex.mockResolvedValue(items)

      const result = await indexedDB.getList(mockDatabaseId, {
        indexName: mockIndexName,
        search: 'bikes',
      })

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(3)
    })

    it('should sort items by createdAt ascending', async () => {
      const items: QueryLibraryItem[] = [
        queryLibraryItemFactory.build({
          createdAt: '2026-01-03T00:00:00.000Z',
        }),
        queryLibraryItemFactory.build({
          createdAt: '2026-01-01T00:00:00.000Z',
        }),
        queryLibraryItemFactory.build({
          createdAt: '2026-01-02T00:00:00.000Z',
        }),
      ]
      mockedStorage.getAllByIndex.mockResolvedValue(items)

      const result = await indexedDB.getList(mockDatabaseId, {
        indexName: mockIndexName,
      })

      expect(result.data![0].createdAt).toBe('2026-01-01T00:00:00.000Z')
      expect(result.data![1].createdAt).toBe('2026-01-02T00:00:00.000Z')
      expect(result.data![2].createdAt).toBe('2026-01-03T00:00:00.000Z')
    })

    it('should return empty array when storage is empty', async () => {
      mockedStorage.getAllByIndex.mockResolvedValue([])

      const result = await indexedDB.getList(mockDatabaseId, {
        indexName: mockIndexName,
      })

      expect(result).toEqual({ success: true, data: [] })
    })

    it('should return error on storage failure', async () => {
      const mockError = new Error('IndexedDB error')
      mockedStorage.getAllByIndex.mockRejectedValue(mockError)

      const result = await indexedDB.getList(mockDatabaseId, {
        indexName: mockIndexName,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })

  describe('getOne', () => {
    it('should return item when found and databaseId matches', async () => {
      const mockItem = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      })
      mockedStorage.getById.mockResolvedValue(mockItem)

      const result = await indexedDB.getOne(mockDatabaseId, mockItem.id)

      expect(result).toEqual({ success: true, data: mockItem })
      expect(mockedStorage.getById).toHaveBeenCalledWith(mockItem.id)
    })

    it('should return success false when item not found', async () => {
      mockedStorage.getById.mockResolvedValue(undefined)

      const result = await indexedDB.getOne(mockDatabaseId, faker.string.uuid())

      expect(result).toEqual({ success: false })
    })

    it('should return success false when databaseId does not match', async () => {
      const mockItem = queryLibraryItemFactory.build({
        databaseId: 'other-db-id',
      })
      mockedStorage.getById.mockResolvedValue(mockItem)

      const result = await indexedDB.getOne(mockDatabaseId, mockItem.id)

      expect(result).toEqual({ success: false })
    })

    it('should return error on storage failure', async () => {
      const mockError = new Error('IndexedDB error')
      mockedStorage.getById.mockRejectedValue(mockError)

      const result = await indexedDB.getOne(mockDatabaseId, faker.string.uuid())

      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })

  describe('create', () => {
    it('should create item with Saved type and store it', async () => {
      mockedStorage.put.mockResolvedValue(undefined)
      const input = createQueryLibraryItemFactory.build({
        indexName: mockIndexName,
      })

      const result = await indexedDB.create(mockDatabaseId, input)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        databaseId: mockDatabaseId,
        indexName: input.indexName,
        type: QueryLibraryType.Saved,
        name: input.name,
        query: input.query,
      })
      expect(result.data?.id).toBeDefined()
      expect(result.data?.createdAt).toBeDefined()
      expect(result.data?.updatedAt).toBeDefined()
      expect(mockedStorage.put).toHaveBeenCalledTimes(1)
    })

    it('should return error on storage failure', async () => {
      const mockError = new Error('IndexedDB error')
      mockedStorage.put.mockRejectedValue(mockError)
      const input = createQueryLibraryItemFactory.build()

      const result = await indexedDB.create(mockDatabaseId, input)

      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })

  describe('update', () => {
    it('should update only provided fields', async () => {
      const existing = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
        name: 'Original',
        query: 'FT.SEARCH idx "*"',
        description: 'Original desc',
      })
      mockedStorage.getById.mockResolvedValue(existing)
      mockedStorage.put.mockResolvedValue(undefined)

      const result = await indexedDB.update(mockDatabaseId, existing.id, {
        name: 'Updated',
      })

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Updated')
      expect(result.data?.query).toBe('FT.SEARCH idx "*"')
      expect(result.data?.description).toBe('Original desc')
    })

    it('should return success false when item not found', async () => {
      mockedStorage.getById.mockResolvedValue(undefined)

      const result = await indexedDB.update(
        mockDatabaseId,
        faker.string.uuid(),
        { name: 'Updated' },
      )

      expect(result).toEqual({ success: false })
    })

    it('should return error on storage failure', async () => {
      const existing = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      })
      mockedStorage.getById.mockResolvedValue(existing)
      const mockError = new Error('IndexedDB error')
      mockedStorage.put.mockRejectedValue(mockError)

      const result = await indexedDB.update(mockDatabaseId, existing.id, {
        name: 'Updated',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })

  describe('delete', () => {
    it('should remove item from storage', async () => {
      const itemId = faker.string.uuid()
      mockedStorage.remove.mockResolvedValue(undefined)

      const result = await indexedDB.delete(mockDatabaseId, itemId)

      expect(result).toEqual({ success: true })
      expect(mockedStorage.remove).toHaveBeenCalledWith(itemId)
    })

    it('should return error on storage failure', async () => {
      const mockError = new Error('IndexedDB error')
      mockedStorage.remove.mockRejectedValue(mockError)

      const result = await indexedDB.delete(mockDatabaseId, faker.string.uuid())

      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })

  describe('seed', () => {
    it('should create items with Sample type', async () => {
      mockedStorage.getAllByIndex.mockResolvedValue([])
      mockedStorage.put.mockResolvedValue(undefined)

      const seedItems = seedQueryLibraryItemFactory.buildList(2, {
        indexName: mockIndexName,
      })

      const result = await indexedDB.seed(mockDatabaseId, seedItems)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data![0].type).toBe(QueryLibraryType.Sample)
      expect(result.data![0].name).toBe(seedItems[0].name)
      expect(result.data![1].type).toBe(QueryLibraryType.Sample)
      expect(result.data![1].name).toBe(seedItems[1].name)
      expect(mockedStorage.put).toHaveBeenCalledTimes(2)
    })

    it('should return existing items when samples already exist', async () => {
      const existingItems = queryLibraryItemFactory.buildList(2, {
        type: QueryLibraryType.Sample,
        indexName: mockIndexName,
      })
      mockedStorage.getAllByIndex.mockResolvedValue(existingItems)

      const result = await indexedDB.seed(mockDatabaseId, [
        seedQueryLibraryItemFactory.build({ indexName: mockIndexName }),
      ])

      expect(result.success).toBe(true)
      expect(result.data).toEqual(existingItems)
      expect(mockedStorage.put).not.toHaveBeenCalled()
    })

    it('should return empty array for empty seed list', async () => {
      const result = await indexedDB.seed(mockDatabaseId, [])

      expect(result).toEqual({ success: true, data: [] })
      expect(mockedStorage.getAllByIndex).not.toHaveBeenCalled()
    })

    it('should return error on storage failure', async () => {
      const mockError = new Error('IndexedDB error')
      mockedStorage.getAllByIndex.mockResolvedValue([])
      mockedStorage.put.mockRejectedValue(mockError)

      const result = await indexedDB.seed(mockDatabaseId, [
        seedQueryLibraryItemFactory.build({ indexName: mockIndexName }),
      ])

      expect(result.success).toBe(false)
      expect(result.error).toBe(mockError)
    })
  })
})
