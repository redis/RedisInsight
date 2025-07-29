import { renderHook, act } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { mswServer } from 'uiSrc/mocks/server'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { useLoadData } from './useLoadData'

describe('useLoadData', () => {
  const instanceId = 'test-instance-id'
  const collectionName = 'test-collection'

  beforeEach(() => {
    mswServer.resetHandlers()
  })

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useLoadData())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should successfully load data and return response', async () => {
    const mockResponse = {
      id: 'bulk-action-123',
      summary: {
        processed: 100,
        succeed: 95,
        failed: 5,
      },
      status: 'completed',
    }

    mswServer.use(
      rest.post(
        getMswURL(
          getUrl(
            instanceId,
            ApiEndpoints.BULK_ACTIONS_IMPORT_VECTOR_COLLECTION,
          ),
        ),
        async (req, res, ctx) => {
          const body = await req.json()
          expect(body).toEqual({ collectionName })
          return res(ctx.status(200), ctx.json(mockResponse))
        },
      ),
    )

    const { result } = renderHook(() => useLoadData())

    let returnedData
    await act(async () => {
      returnedData = await result.current.load(instanceId, collectionName)
    })

    expect(returnedData).toEqual(mockResponse)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should set loading state correctly during API call', async () => {
    const mockResponse = { id: '123' }
    let resolveRequest: () => void
    const requestPromise = new Promise<void>((resolve) => {
      resolveRequest = resolve
    })

    mswServer.use(
      rest.post(
        getMswURL(
          getUrl(
            instanceId,
            ApiEndpoints.BULK_ACTIONS_IMPORT_VECTOR_COLLECTION,
          ),
        ),
        async (_, res, ctx) => {
          await requestPromise
          return res(ctx.status(200), ctx.json(mockResponse))
        },
      ),
    )

    const { result } = renderHook(() => useLoadData())

    expect(result.current.loading).toBe(false)

    // Start the request without awaiting
    act(() => {
      result.current.load(instanceId, collectionName)
    })

    // Loading should be true while request is pending
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    // Complete the request
    await act(async () => {
      resolveRequest()
    })

    // Loading should be false after completion
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle API errors correctly when error is an Error instance', async () => {
    const errorMessage = 'Network error occurred'

    mswServer.use(
      rest.post(
        getMswURL(
          getUrl(
            instanceId,
            ApiEndpoints.BULK_ACTIONS_IMPORT_VECTOR_COLLECTION,
          ),
        ),
        async (_, res, ctx) =>
          res(ctx.status(500), ctx.json({ message: errorMessage })),
      ),
    )

    const { result } = renderHook(() => useLoadData())

    await act(async () => {
      try {
        await result.current.load(instanceId, collectionName)
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('should reset error state on new load attempt', async () => {
    const mockResponse = { id: '123' }
    let callCount = 0

    // Mock first call to fail, second to succeed
    mswServer.use(
      rest.post(
        getMswURL(
          getUrl(
            instanceId,
            ApiEndpoints.BULK_ACTIONS_IMPORT_VECTOR_COLLECTION,
          ),
        ),
        async (_, res, ctx) => {
          callCount++
          if (callCount === 1) {
            return res(ctx.status(500), ctx.json({ message: 'Server error' }))
          }
          return res(ctx.status(200), ctx.json(mockResponse))
        },
      ),
    )

    const { result } = renderHook(() => useLoadData())

    // First call fails
    await act(async () => {
      try {
        await result.current.load(instanceId, collectionName)
      } catch {
        // Expected to fail
      }
    })

    expect(result.current.error).toBeInstanceOf(Error)

    // Second call succeeds
    await act(async () => {
      await result.current.load(instanceId, collectionName)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle multiple concurrent calls correctly', async () => {
    const mockResponse1 = { id: '123' }
    const mockResponse2 = { id: '456' }
    let callCount = 0

    mswServer.use(
      rest.post(
        getMswURL(
          getUrl(
            instanceId,
            ApiEndpoints.BULK_ACTIONS_IMPORT_VECTOR_COLLECTION,
          ),
        ),
        async (_, res, ctx) => {
          callCount++
          const response = callCount === 1 ? mockResponse1 : mockResponse2
          return res(ctx.status(200), ctx.json(response))
        },
      ),
    )

    const { result } = renderHook(() => useLoadData())

    let result1: any
    let result2: any

    await act(async () => {
      const [promise1, promise2] = await Promise.all([
        result.current.load(instanceId, 'collection1'),
        result.current.load(instanceId, 'collection2'),
      ])
      result1 = promise1
      result2 = promise2
    })

    expect(result1).toEqual(mockResponse1)
    expect(result2).toEqual(mockResponse2)
    expect(result.current.loading).toBe(false)
  })

  it('should call API with correct parameters for different collections', async () => {
    const mockResponse = { id: '123' }
    const requestBodies: any[] = []

    mswServer.use(
      rest.post(
        '*/bulk-actions/import/vector-collection',
        async (req, res, ctx) => {
          const body = await req.json()
          requestBodies.push(body)
          return res(ctx.status(200), ctx.json(mockResponse))
        },
      ),
    )

    const { result } = renderHook(() => useLoadData())

    await act(async () => {
      await result.current.load('instance-1', 'bikes')
    })

    await act(async () => {
      await result.current.load('instance-2', 'cars')
    })

    expect(requestBodies).toHaveLength(2)
    expect(requestBodies[0]).toEqual({ collectionName: 'bikes' })
    expect(requestBodies[1]).toEqual({ collectionName: 'cars' })
  })
})
