import { renderHook } from '@testing-library/react'
import reactRouterDom from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { useRdiPipelineNavigation } from './useRdiPipelineNavigation'

describe('useRdiPipelineNavigation', () => {
  let pushMock: jest.Mock
  let replaceMock: jest.Mock
  let goBackMock: jest.Mock
  let listenMock: jest.Mock

  beforeEach(() => {
    pushMock = jest.fn()
    replaceMock = jest.fn()
    goBackMock = jest.fn()
    listenMock = jest.fn().mockReturnValue(jest.fn())

    reactRouterDom.useHistory = jest.fn().mockReturnValue({
      push: pushMock,
      replace: replaceMock,
      goBack: goBackMock,
      listen: listenMock,
    })
    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: '/integrate/123/pipeline-management-v2' })
  })

  it('should return the current pathname', () => {
    const { result } = renderHook(() => useRdiPipelineNavigation())

    expect(result.current.getPath()).toBe(
      '/integrate/123/pipeline-management-v2',
    )
  })

  it('should push by default when navigating', () => {
    const { result } = renderHook(() => useRdiPipelineNavigation())

    result.current.navigate('/some/path')

    expect(pushMock).toHaveBeenCalledWith('/some/path')
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('should replace when navigating with the replace option', () => {
    const { result } = renderHook(() => useRdiPipelineNavigation())

    result.current.navigate('/some/path', { replace: true })

    expect(replaceMock).toHaveBeenCalledWith('/some/path')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('should delegate goBack to history', () => {
    const { result } = renderHook(() => useRdiPipelineNavigation())

    result.current.goBack()

    expect(goBackMock).toHaveBeenCalled()
  })

  it('should push to the rdi home page on exit', () => {
    const { result } = renderHook(() => useRdiPipelineNavigation())

    result.current.exit()

    expect(pushMock).toHaveBeenCalledWith(Pages.rdi)
  })

  it('should subscribe to history changes and return an unsubscribe function', () => {
    const unlisten = jest.fn()
    listenMock.mockReturnValue(unlisten)
    const { result } = renderHook(() => useRdiPipelineNavigation())
    const callback = jest.fn()

    const unsubscribe = result.current.subscribe(callback)
    const [historyListener] = listenMock.mock.calls[0]
    historyListener()

    expect(callback).toHaveBeenCalled()
    expect(unsubscribe).toBe(unlisten)
  })
})
