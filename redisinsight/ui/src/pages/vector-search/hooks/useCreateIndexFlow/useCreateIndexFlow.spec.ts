import { http, HttpResponse } from 'msw'
import { renderHook, act, mockedStore, getMswURL } from 'uiSrc/utils/test-utils'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { mswServer } from 'uiSrc/mocks/server'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { QueryLibraryService } from 'uiSrc/services/query-library/QueryLibraryService'
import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { EditorTab } from '../../components/query-editor/QueryEditor.types'
import { createIndexNotifications } from '../../constants'
import { useCreateIndexFlow } from './useCreateIndexFlow'

const mockPush = jest.fn()
const mockCreateIndexRun = jest.fn()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const routerDom = require('react-router-dom')

jest.mock('../useCreateIndex', () => ({
  useCreateIndex: () => ({
    run: mockCreateIndexRun,
    loading: false,
  }),
}))

let mockExistingIndexes: string[] = []
jest.mock('../useRedisearchListData', () => ({
  useRedisearchListData: () => ({
    stringData: mockExistingIndexes,
  }),
}))

describe('useCreateIndexFlow', () => {
  const originalUseHistory = routerDom.useHistory

  beforeEach(() => {
    jest.clearAllMocks()
    mockedStore.clearActions()
    mockExistingIndexes = []

    routerDom.useHistory = () => ({ push: mockPush })
  })

  afterAll(() => {
    routerDom.useHistory = originalUseHistory
  })

  describe('when index does not exist', () => {
    it('should call createIndex and seed sample queries on success', async () => {
      const seedSpy = jest.spyOn(QueryLibraryService.prototype, 'seed')

      const { result } = renderHook(() => useCreateIndexFlow())

      await act(async () => {
        result.current.run(
          INSTANCE_ID_MOCK,
          SampleDataContent.E_COMMERCE_DISCOVERY,
        )
      })

      expect(mockCreateIndexRun).toHaveBeenCalledWith(
        {
          instanceId: INSTANCE_ID_MOCK,
          indexName: 'idx:bikes_vss',
          dataContent: SampleDataContent.E_COMMERCE_DISCOVERY,
        },
        expect.any(Function),
        expect.any(Function),
      )

      const onSuccess = mockCreateIndexRun.mock.calls[0][1]
      await act(async () => {
        await onSuccess()
      })

      expect(seedSpy).toHaveBeenCalledWith(
        INSTANCE_ID_MOCK,
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'idx:bikes_vss',
            name: expect.any(String),
            query: expect.any(String),
          }),
        ]),
      )

      expect(mockPush).toHaveBeenCalledWith({
        pathname: expect.stringContaining('idx%3Abikes_vss'),
        state: { activeTab: EditorTab.Library },
      })

      expect(mockedStore.getActions()).toContainEqual(
        addMessageNotification(createIndexNotifications.sampleDataCreated()),
      )
    })

    it('should dispatch createFailed notification on error', async () => {
      const { result } = renderHook(() => useCreateIndexFlow())

      await act(async () => {
        result.current.run(
          INSTANCE_ID_MOCK,
          SampleDataContent.E_COMMERCE_DISCOVERY,
        )
      })

      const onError = mockCreateIndexRun.mock.calls[0][2]
      act(() => {
        onError()
      })

      expect(mockedStore.getActions()).toContainEqual(
        addMessageNotification(createIndexNotifications.createFailed()),
      )
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should navigate only after seed completes', async () => {
      const seedUrl = getMswURL(
        getUrl(INSTANCE_ID_MOCK, ApiEndpoints.QUERY_LIBRARY_SEED),
      )
      let seedResponseSent = false
      mswServer.use(
        http.post(seedUrl, async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 0)
          })
          seedResponseSent = true
          return HttpResponse.json([], { status: 200 })
        }),
      )
      mockPush.mockImplementation(() => {
        expect(seedResponseSent).toBe(true)
      })

      const { result } = renderHook(() => useCreateIndexFlow())

      await act(async () => {
        result.current.run(
          INSTANCE_ID_MOCK,
          SampleDataContent.E_COMMERCE_DISCOVERY,
        )
      })

      const onSuccess = mockCreateIndexRun.mock.calls[0][1]
      await act(async () => {
        await onSuccess()
      })

      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('when index already exists', () => {
    beforeEach(() => {
      mockExistingIndexes = ['idx:bikes_vss']
    })

    it('should seed sample queries and navigate to query page', async () => {
      const { result } = renderHook(() => useCreateIndexFlow())

      await act(async () => {
        await result.current.run(
          INSTANCE_ID_MOCK,
          SampleDataContent.E_COMMERCE_DISCOVERY,
        )
      })

      expect(mockCreateIndexRun).not.toHaveBeenCalled()

      expect(mockPush).toHaveBeenCalledWith({
        pathname: expect.stringContaining('idx%3Abikes_vss'),
        state: { activeTab: EditorTab.Library },
      })

      expect(mockedStore.getActions()).toContainEqual(
        addMessageNotification(
          createIndexNotifications.sampleDataAlreadyExists(),
        ),
      )
    })
  })

  describe('movies dataset', () => {
    it('should seed movie sample queries with correct index name', async () => {
      const seedSpy = jest.spyOn(QueryLibraryService.prototype, 'seed')

      const { result } = renderHook(() => useCreateIndexFlow())

      await act(async () => {
        result.current.run(
          INSTANCE_ID_MOCK,
          SampleDataContent.CONTENT_RECOMMENDATIONS,
        )
      })

      const onSuccess = mockCreateIndexRun.mock.calls[0][1]
      await act(async () => {
        await onSuccess()
      })

      expect(seedSpy).toHaveBeenCalledWith(
        INSTANCE_ID_MOCK,
        expect.arrayContaining([
          expect.objectContaining({
            indexName: 'idx:movies_vss',
            name: expect.any(String),
            query: expect.any(String),
          }),
        ]),
      )
    })
  })
})
