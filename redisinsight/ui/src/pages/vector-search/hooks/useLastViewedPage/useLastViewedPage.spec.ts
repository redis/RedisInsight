import reactRouterDom from 'react-router-dom'
import { renderHook } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'

import { useLastViewedPage } from './useLastViewedPage'

describe('useLastViewedPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to the last viewed page and clear it', () => {
    const savedPage = Pages.vectorSearchCreateIndex('instanceId')
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: savedPage })
    const { unmount } = renderHook(() => useLastViewedPage())
    unmount()

    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.vectorSearch('instanceId') })
    renderHook(() => useLastViewedPage())

    expect(pushMock).toHaveBeenCalledWith(savedPage)
  })

  it('should not redirect when there is no saved page', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValue({
      pathname: Pages.vectorSearch('instanceId'),
    })

    renderHook(() => useLastViewedPage())

    expect(pushMock).not.toHaveBeenCalled()
  })

  it('should not redirect when saved page belongs to a different instance', () => {
    const savedPage = Pages.vectorSearchCreateIndex('instanceA')
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: savedPage })
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: 'instanceA' })
    const { unmount } = renderHook(() => useLastViewedPage())
    unmount()

    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.vectorSearch('instanceB') })
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: 'instanceB' })
    renderHook(() => useLastViewedPage())

    expect(pushMock).not.toHaveBeenCalled()
  })
})
