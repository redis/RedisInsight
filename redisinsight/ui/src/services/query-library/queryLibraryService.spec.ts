import { merge } from 'lodash'
import { faker } from '@faker-js/faker'

import { RootState, store } from 'uiSrc/slices/store'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { initialState as appFeaturesInitialState } from 'uiSrc/slices/app/features'
import {
  queryLibraryItemFactory,
  createQueryLibraryItemFactory,
  seedQueryLibraryItemFactory,
} from 'uiSrc/mocks/factories/query-library/queryLibraryItem.factory'

import { QueryLibraryService } from './queryLibraryService'
import { QueryLibraryDatabase } from './database/interface'
import { QueryLibrarySQLite } from './database/QueryLibrarySQLite'
import { QueryLibraryIndexedDB } from './database/QueryLibraryIndexedDB'

jest.mock('./database/QueryLibrarySQLite')
jest.mock('./database/QueryLibraryIndexedDB', () => ({
  QueryLibraryIndexedDB: jest.fn().mockImplementation(() => ({
    getList: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getOne: jest.fn().mockResolvedValue({ success: true, data: null }),
    create: jest.fn().mockResolvedValue({ success: true, data: null }),
    update: jest.fn().mockResolvedValue({ success: true, data: null }),
    delete: jest.fn().mockResolvedValue({ success: true }),
    seed: jest.fn().mockResolvedValue({ success: true, data: [] }),
  })),
}))

jest.mock('uiSrc/slices/app/notifications', () => ({
  addErrorNotification: jest.fn((error) => ({
    type: 'app/notifications/addErrorNotification',
    payload: error,
  })),
}))

jest.mock('uiSrc/slices/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}))

const mockedSQLite = jest.mocked(QueryLibrarySQLite)
const mockedIndexedDB = jest.mocked(QueryLibraryIndexedDB)
const mockedAddErrorNotification = addErrorNotification as unknown as jest.Mock

describe('QueryLibraryService', () => {
  const mockedStore = jest.mocked(store)

  const mockDatabaseId = faker.string.uuid()
  const mockIndexName = `idx:${faker.word.noun()}`
  const mockFilter = { indexName: mockIndexName }
  const mockItems = queryLibraryItemFactory.buildList(3, {
    databaseId: mockDatabaseId,
    indexName: mockIndexName,
  })
  const mockItem = queryLibraryItemFactory.build({
    databaseId: mockDatabaseId,
    indexName: mockIndexName,
  })

  const createDefaultDatabaseMock = (
    overrides: Partial<Record<keyof QueryLibraryDatabase, jest.Mock>> = {},
  ): QueryLibraryDatabase => ({
    getList: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getOne: jest.fn().mockResolvedValue({ success: true, data: null }),
    create: jest.fn().mockResolvedValue({ success: true, data: null }),
    update: jest.fn().mockResolvedValue({ success: true, data: null }),
    delete: jest.fn().mockResolvedValue({ success: true }),
    seed: jest.fn().mockResolvedValue({ success: true, data: [] }),
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockedStore.getState.mockReturnValue({
      app: {
        features: merge({}, appFeaturesInitialState, {
          featureFlags: {
            features: {
              [FeatureFlags.envDependent]: { flag: false },
            },
          },
        }),
      },
    } as RootState)
    mockedStore.dispatch.mockClear()

    mockedIndexedDB.mockImplementation(() => createDefaultDatabaseMock())
  })

  describe('initializeDatabase', () => {
    it('should use IndexedDB when envDependent is disabled', () => {
      const service = new QueryLibraryService()
      expect(mockedIndexedDB).toHaveBeenCalled()
      expect(service).toBeDefined()
    })

    it('should use SQLite when envDependent is enabled', () => {
      mockedStore.getState.mockReturnValue({
        app: {
          features: merge({}, appFeaturesInitialState, {
            featureFlags: {
              features: {
                [FeatureFlags.envDependent]: { flag: true },
              },
            },
          }),
        },
      } as RootState)

      const service = new QueryLibraryService()
      expect(mockedSQLite).toHaveBeenCalled()
      expect(service).toBeDefined()
    })
  })

  describe('getList', () => {
    it('should return items on success', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          getList: jest.fn().mockResolvedValue({
            success: true,
            data: mockItems,
          }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.getList(mockDatabaseId, mockFilter)

      expect(result).toEqual(mockItems)
    })

    it('should return empty array when data is undefined', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          getList: jest
            .fn()
            .mockResolvedValue({ success: true, data: undefined }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.getList(mockDatabaseId, mockFilter)

      expect(result).toEqual([])
    })

    it('should dispatch error notification on error', async () => {
      const mockError = new Error('Request failed')

      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          getList: jest
            .fn()
            .mockResolvedValue({ success: false, error: mockError }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.getList(mockDatabaseId, mockFilter)

      expect(result).toEqual([])
      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        mockedAddErrorNotification(mockError),
      )
    })
  })

  describe('getOne', () => {
    it('should return item on success', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          getOne: jest.fn().mockResolvedValue({
            success: true,
            data: mockItem,
          }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.getOne(mockDatabaseId, mockItem.id)

      expect(result).toEqual(mockItem)
    })

    it('should return null when item not found', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          getOne: jest.fn().mockResolvedValue({ success: false }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.getOne(mockDatabaseId, mockItem.id)

      expect(result).toEqual(null)
    })

    it('should dispatch error notification on error', async () => {
      const mockError = new Error('Not found')

      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          getOne: jest
            .fn()
            .mockResolvedValue({ success: false, error: mockError }),
        }),
      )

      const service = new QueryLibraryService()
      await service.getOne(mockDatabaseId, mockItem.id)

      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        mockedAddErrorNotification(mockError),
      )
    })
  })

  describe('create', () => {
    const createDto = createQueryLibraryItemFactory.build({
      indexName: mockIndexName,
    })

    it('should return created item on success', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          create: jest.fn().mockResolvedValue({
            success: true,
            data: mockItem,
          }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.create(mockDatabaseId, createDto)

      expect(result).toEqual(mockItem)
    })

    it('should return null on failure', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          create: jest.fn().mockResolvedValue({ success: false }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.create(mockDatabaseId, createDto)

      expect(result).toEqual(null)
    })

    it('should dispatch error notification on error', async () => {
      const mockError = new Error('Create failed')

      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          create: jest
            .fn()
            .mockResolvedValue({ success: false, error: mockError }),
        }),
      )

      const service = new QueryLibraryService()
      await service.create(mockDatabaseId, createDto)

      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        mockedAddErrorNotification(mockError),
      )
    })
  })

  describe('update', () => {
    const updateDto = { name: faker.lorem.words(2) }

    it('should return updated item on success', async () => {
      const updated = { ...mockItem, ...updateDto }

      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          update: jest.fn().mockResolvedValue({
            success: true,
            data: updated,
          }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.update(
        mockDatabaseId,
        mockItem.id,
        updateDto,
      )

      expect(result).toEqual(updated)
    })

    it('should return null on failure', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          update: jest.fn().mockResolvedValue({ success: false }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.update(
        mockDatabaseId,
        mockItem.id,
        updateDto,
      )

      expect(result).toEqual(null)
    })

    it('should dispatch error notification on error', async () => {
      const mockError = new Error('Update failed')

      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          update: jest
            .fn()
            .mockResolvedValue({ success: false, error: mockError }),
        }),
      )

      const service = new QueryLibraryService()
      await service.update(mockDatabaseId, mockItem.id, updateDto)

      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        mockedAddErrorNotification(mockError),
      )
    })
  })

  describe('delete', () => {
    it('should delete successfully without dispatching errors', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          delete: jest.fn().mockResolvedValue({ success: true }),
        }),
      )

      const service = new QueryLibraryService()
      await service.delete(mockDatabaseId, mockItem.id)

      expect(mockedStore.dispatch).not.toHaveBeenCalled()
    })

    it('should dispatch error notification on error', async () => {
      const mockError = new Error('Delete failed')

      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          delete: jest
            .fn()
            .mockResolvedValue({ success: false, error: mockError }),
        }),
      )

      const service = new QueryLibraryService()
      await service.delete(mockDatabaseId, mockItem.id)

      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        mockedAddErrorNotification(mockError),
      )
    })
  })

  describe('seed', () => {
    const seedItems = seedQueryLibraryItemFactory.buildList(1, {
      indexName: mockIndexName,
    })

    it('should return seeded items on success', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          seed: jest.fn().mockResolvedValue({
            success: true,
            data: mockItems,
          }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.seed(mockDatabaseId, seedItems)

      expect(result).toEqual(mockItems)
    })

    it('should return empty array on failure', async () => {
      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          seed: jest.fn().mockResolvedValue({ success: false }),
        }),
      )

      const service = new QueryLibraryService()
      const result = await service.seed(mockDatabaseId, seedItems)

      expect(result).toEqual([])
    })

    it('should dispatch error notification on error', async () => {
      const mockError = new Error('Seed failed')

      mockedIndexedDB.mockImplementation(() =>
        createDefaultDatabaseMock({
          seed: jest
            .fn()
            .mockResolvedValue({ success: false, error: mockError }),
        }),
      )

      const service = new QueryLibraryService()
      await service.seed(mockDatabaseId, seedItems)

      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        mockedAddErrorNotification(mockError),
      )
    })
  })

})
