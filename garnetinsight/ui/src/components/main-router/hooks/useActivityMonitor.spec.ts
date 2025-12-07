import set from 'lodash/set'
import { renderHook } from '@testing-library/react-hooks'
import { getConfig } from 'uiSrc/config'
import { mockWindowLocation } from 'uiSrc/utils/test-utils'
import { useActivityMonitor } from './useActivityMonitor'

const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
const addEventListenerProps = { passive: true, capture: true }
const removeEventListenerProps = { capture: true }

const riConfig = getConfig()

const mockConfig = (origin = 'http://localhost', throttleTimeout = 200) => {
  set(riConfig, 'app.activityMonitorOrigin', origin)
  set(riConfig, 'app.activityMonitorThrottleTimeout', throttleTimeout)
}

const mockWindowOpener = (postMessage = jest.fn()) => {
  global.window.opener = {
    postMessage,
  }
}

jest.useFakeTimers()

const browserUrl = 'http://localhost/123/browser'
const logoutUrl = 'http://localhost/#/logout'

let setHrefMock: typeof jest.fn
beforeEach(() => {
  jest.resetAllMocks()

  const mockDate = new Date('2024-11-22T12:00:00Z')
  jest.setSystemTime(mockDate)

  mockConfig()
  setHrefMock = mockWindowLocation(browserUrl)
  mockWindowOpener()
})

describe('useActivityMonitor', () => {
  it('should register event handlers on mount and unregister on unmount', () => {
    const { unmount } = renderHook(useActivityMonitor)

    // Verify mount behavior
    expect(addEventListenerSpy).toHaveBeenCalledTimes(4)
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      1,
      'click',
      expect.any(Function),
      addEventListenerProps,
    )
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      2,
      'keydown',
      expect.any(Function),
      addEventListenerProps,
    )
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      3,
      'scroll',
      expect.any(Function),
      addEventListenerProps,
    )
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(
      4,
      'touchstart',
      expect.any(Function),
      addEventListenerProps,
    )

    // Trigger unmount
    unmount()

    // Verify unmount behavior
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(4)
    expect(removeEventListenerSpy).toHaveBeenNthCalledWith(
      1,
      'click',
      expect.any(Function),
      removeEventListenerProps,
    )
    expect(removeEventListenerSpy).toHaveBeenNthCalledWith(
      2,
      'keydown',
      expect.any(Function),
      removeEventListenerProps,
    )
    expect(removeEventListenerSpy).toHaveBeenNthCalledWith(
      3,
      'scroll',
      expect.any(Function),
      removeEventListenerProps,
    )
    expect(removeEventListenerSpy).toHaveBeenNthCalledWith(
      4,
      'touchstart',
      expect.any(Function),
      removeEventListenerProps,
    )
  })

  it('should register event handlers even if window.opener is undefined', () => {
    global.window.opener = undefined

    const { unmount } = renderHook(useActivityMonitor)

    // Verify mount behavior
    expect(addEventListenerSpy).toHaveBeenCalledTimes(4)

    // Trigger unmount
    unmount()

    // Verify unmount behavior
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(4)
  })

  it('should not register handlers if activityMonitorOrigin is not defined', () => {
    mockConfig('')

    const { unmount } = renderHook(useActivityMonitor)

    // Verify mount behavior
    expect(addEventListenerSpy).not.toHaveBeenCalled()

    // Trigger unmount
    unmount()

    // Verify unmount behavior
    expect(removeEventListenerSpy).not.toHaveBeenCalled()
  })

  it('should logout user after expected amount of inactivity', async () => {
    renderHook(useActivityMonitor)
    jest.advanceTimersByTime(1900 * 1000)
    expect(setHrefMock).toHaveBeenCalledWith(logoutUrl)
  })

  it('should not logout user if hook unmounts', async () => {
    const { unmount } = renderHook(useActivityMonitor)
    jest.advanceTimersByTime(1700 * 1000)
    expect(setHrefMock).not.toHaveBeenCalled()

    unmount()

    jest.advanceTimersByTime(1000 * 1000)
    expect(setHrefMock).not.toHaveBeenCalled()
  })

  it('should keep user logged in if they stay active', async () => {
    renderHook(useActivityMonitor)

    const activityHandler = addEventListenerSpy.mock.calls[0]?.[1] as Function

    // act
    jest.advanceTimersByTime(1700 * 1000)
    activityHandler()
    jest.advanceTimersByTime(1700 * 1000)

    // assert
    expect(setHrefMock).not.toHaveBeenCalled()

    // act
    activityHandler()
    jest.advanceTimersByTime(1700 * 1000)

    // assert
    expect(setHrefMock).not.toHaveBeenCalled()

    // act
    jest.advanceTimersByTime(1000 * 1000)

    // assert
    expect(setHrefMock).toHaveBeenCalledWith(logoutUrl)
  })

  it('should throttle events and call window.opener.postMessage', async () => {
    const mockPostMessage = jest.fn()

    mockWindowOpener(mockPostMessage)
    renderHook(useActivityMonitor)

    // act
    const activityHandler = addEventListenerSpy.mock.calls[0]?.[1] as Function
    activityHandler()
    activityHandler()
    activityHandler()
    activityHandler()

    jest.advanceTimersByTime(20_000)

    // assert
    expect(mockPostMessage).toHaveBeenCalledTimes(1)
  })

  it('should ignore errors from activity handler function', async () => {
    const mockPostMessage = jest.fn(() => {
      throw new Error('test')
    })

    mockWindowOpener(mockPostMessage)
    renderHook(useActivityMonitor)

    expect(addEventListenerSpy).toHaveBeenCalledTimes(4)

    // simulate events
    const activityHandler = addEventListenerSpy.mock.calls[0]?.[1] as Function
    expect(() => activityHandler()).not.toThrow()
  })

  it('should ignore errors from window.addEventListener', () => {
    jest.spyOn(window, 'addEventListener').mockImplementation(
      jest.fn(() => {
        throw new Error('Test')
      }),
    )

    mockWindowOpener()

    expect(() => renderHook(useActivityMonitor)).not.toThrow()
    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
  })
})
