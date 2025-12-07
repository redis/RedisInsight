/* eslint-disable sonarjs/no-duplicate-string */
import { cloneDeep } from 'lodash'
import React from 'react'
import MockedSocket from 'socket.io-mock'
import socketIO from 'socket.io-client'
import {
  monitorSelector,
  setMonitorLoadingPause,
  pauseMonitor,
  setSocket,
  stopMonitor,
  lockResume,
  setLogFileId,
  setStartTimestamp,
} from 'uiSrc/slices/cli/monitor'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { MonitorEvent, SocketEvent } from 'uiSrc/constants'
import * as ioHooks from 'uiSrc/services/hooks/useIoConnection'
import { getSocketApiUrl } from 'uiSrc/utils'
import MonitorConfig from './MonitorConfig'

let store: typeof mockedStore
let socket: typeof MockedSocket
let useIoConnectionSpy: jest.SpyInstance

beforeEach(() => {
  cleanup()
  socket = new MockedSocket()
  socketIO.mockReturnValue(socket)
  useIoConnectionSpy = jest.spyOn(ioHooks, 'useIoConnection')
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('socket.io-client')

jest.mock('uiSrc/slices/cli/monitor', () => ({
  ...jest.requireActual('uiSrc/slices/cli/monitor'),
  monitorSelector: jest.fn().mockReturnValue({
    isRunning: false,
    isMinimizedMonitor: false,
    isShowMonitor: true,
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1',
  }),
}))

describe('MonitorConfig', () => {
  it('should render', () => {
    expect(render(<MonitorConfig />)).toBeTruthy()
  })

  it('socket should be set to store', () => {
    render(<MonitorConfig />)

    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    const { unmount } = render(<MonitorConfig />)
    const afterRenderActions = [setSocket(socket), setMonitorLoadingPause(true)]
    expect(store.getActions()).toEqual([...afterRenderActions])
    expect(useIoConnectionSpy).toHaveBeenCalledWith(
      getSocketApiUrl('monitor'),
      { query: { instanceId: '1' }, token: '' },
    )

    unmount()
  })

  it(`should emit ${MonitorEvent.Monitor} event`, () => {
    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
      isSaveToFile: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    const { unmount } = render(<MonitorConfig />)

    socket.socketClient.on(MonitorEvent.Monitor, (data: any) => {
      expect(data).toEqual({ logFileId: expect.any(String) })
    })

    socket.socketClient.emit(SocketEvent.Connect)

    const afterRenderActions = [
      setSocket(socket),
      setMonitorLoadingPause(true),
      setLogFileId(expect.any(String)),
      setStartTimestamp(expect.any(Number)),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })

  it(`should not emit ${MonitorEvent.Monitor} event when paused`, () => {
    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
      isPaused: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    const { unmount } = render(<MonitorConfig />)
    const mockedMonitorEvent = jest.fn()

    socket.socketClient.on(MonitorEvent.Monitor, mockedMonitorEvent)
    socket.socketClient.emit(SocketEvent.Connect)

    expect(mockedMonitorEvent).not.toBeCalled()

    unmount()
  })

  it('monitor should catch Exception', () => {
    const { unmount } = render(<MonitorConfig />)

    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    socket.on(MonitorEvent.Exception, (error: Error) => {
      expect(error).toEqual({ message: 'test', name: 'error' })
      // done()
    })

    socket.socketClient.emit(MonitorEvent.Exception, {
      message: 'test',
      name: 'error',
    })

    const afterRenderActions = [
      setSocket(socket),
      setMonitorLoadingPause(true),
      pauseMonitor(),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })

  it('monitor should catch connect_error', () => {
    const { unmount } = render(<MonitorConfig />)

    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    socket.on(SocketEvent.ConnectionError, (error: Error) => {
      expect(error).toEqual({ message: 'test', name: 'error' })
    })

    socket.socketClient.emit(SocketEvent.ConnectionError, {
      message: 'test',
      name: 'error',
    })

    const afterRenderActions = [setSocket(socket), setMonitorLoadingPause(true)]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })

  it('monitor should catch disconnect', () => {
    const { unmount } = render(<MonitorConfig retryDelay={0} />)

    const monitorSelectorMock = jest.fn().mockReturnValue({
      isRunning: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)

    socket.socketClient.emit(SocketEvent.Disconnect)

    const afterRenderActions = [
      setSocket(socket),
      setMonitorLoadingPause(true),
      pauseMonitor(),
      stopMonitor(),
      lockResume(),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })
})
