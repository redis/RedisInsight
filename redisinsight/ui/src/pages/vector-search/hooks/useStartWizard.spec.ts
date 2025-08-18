import { renderHook, act } from '@testing-library/react-hooks'
import { Pages } from 'uiSrc/constants'
import useStartWizard from './useStartWizard'

describe('useStartWizard', () => {
  let mockPush: jest.Mock
  let useHistoryMock: jest.SpyInstance
  let useParamsMock: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush = jest.fn()

    useHistoryMock = jest.spyOn(require('react-router-dom'), 'useHistory')
    useHistoryMock.mockImplementation(() => ({
      push: mockPush,
    }))

    useParamsMock = jest.spyOn(require('react-router-dom'), 'useParams')
    useParamsMock.mockImplementation(() => ({
      instanceId: 'test-instance-id',
    }))
  })

  afterEach(() => {
    useHistoryMock.mockRestore()
    useParamsMock.mockRestore()
  })

  it('should navigate to vector search create index page when start is called', () => {
    const { result } = renderHook(() => useStartWizard())

    act(() => {
      result.current()
    })

    expect(mockPush).toHaveBeenCalledWith(
      Pages.vectorSearchCreateIndex('test-instance-id'),
    )
    expect(mockPush).toHaveBeenCalledTimes(1)
  })

  it('should use instanceId from useParams in navigation', () => {
    const customInstanceId = 'custom-instance-123'
    useParamsMock.mockImplementation(() => ({ instanceId: customInstanceId }))

    const { result } = renderHook(() => useStartWizard())

    act(() => {
      result.current()
    })

    expect(mockPush).toHaveBeenCalledWith(
      Pages.vectorSearchCreateIndex(customInstanceId),
    )
  })

  it('should handle missing instanceId gracefully', () => {
    useParamsMock.mockImplementation(() => ({ instanceId: undefined }))

    const { result } = renderHook(() => useStartWizard())

    act(() => {
      result.current()
    })

    expect(mockPush).toHaveBeenCalledWith(
      Pages.vectorSearchCreateIndex(undefined as any),
    )
  })

  it('should call history.push with correct path format', () => {
    const instanceId = 'test-instance-456'
    useParamsMock.mockImplementation(() => ({ instanceId }))

    const { result } = renderHook(() => useStartWizard())

    act(() => {
      result.current()
    })

    const expectedPath = `/${instanceId}/vector-search/create-index`
    expect(mockPush).toHaveBeenCalledWith(expectedPath)
  })
})
