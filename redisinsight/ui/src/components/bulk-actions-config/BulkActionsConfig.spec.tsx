/* eslint-disable sonarjs/no-duplicate-string */
import { cloneDeep, set } from 'lodash'
import React from 'react'
import MockedSocket from 'socket.io-mock'
import socketIO from 'socket.io-client'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
  mockStore,
  render,
} from 'uiSrc/utils/test-utils'
import {
  BulkActionsServerEvent,
  BulkActionsStatus,
  BulkActionsType,
  FeatureFlags,
  SocketEvent,
} from 'uiSrc/constants'
import {
  bulkActionsDeleteSelector,
  bulkActionsSelector,
  disconnectBulkDeleteAction,
  setBulkActionConnected,
  setBulkDeleteLoading,
  setDeleteOverviewStatus,
} from 'uiSrc/slices/browser/bulkActions'
import { GlobalSubscriptions } from 'uiSrc/components'
import * as ioHooks from 'uiSrc/services/hooks/useIoConnection'
import { getSocketApiUrl } from 'uiSrc/utils'
import BulkActionsConfig from './BulkActionsConfig'

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

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  bulkActionsSelector: jest.fn().mockReturnValue({
    isConnected: false,
  }),
  bulkActionsDeleteSelector: jest.fn().mockReturnValue({
    isActionTriggered: false,
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1',
  }),
}))

const deletingMock = [
  {
    id: '123',
    databaseId: '1',
    db: 1,
    type: BulkActionsType.Unlink,
    filter: {
      type: null,
      match: '*',
    },
  },
]

describe('BulkActionsConfig', () => {
  it('should render', () => {
    expect(render(<BulkActionsConfig />)).toBeTruthy()
  })

  it('should connect socket', () => {
    const bulkActionsDeleteSelectorMock = jest.fn().mockReturnValue({
      isActionTriggered: true,
    })
    bulkActionsDeleteSelector.mockImplementation(bulkActionsDeleteSelectorMock)

    render(<BulkActionsConfig />)

    socket.socketClient.emit(SocketEvent.Connect)

    const afterRenderActions = [
      setBulkActionConnected(true),
      setBulkDeleteLoading(true),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])
    expect(useIoConnectionSpy).toHaveBeenCalledWith(
      getSocketApiUrl('bulk-actions'),
      { query: { instanceId: '1' }, token: '' },
    )
  })

  it('should not connect socket', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    const { unmount } = render(<GlobalSubscriptions />, {
      store: mockStore(initialStoreState),
    })

    socket.socketClient.emit(SocketEvent.Connect)

    expect(store.getActions()).toEqual([])

    unmount()
  })

  it('should not connect socket', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    const { unmount } = render(<GlobalSubscriptions />, {
      store: mockStore(initialStoreState),
    })

    socket.socketClient.emit(SocketEvent.Connect)

    expect(store.getActions()).toEqual([])

    unmount()
  })

  it('should emit Create a delete type', () => {
    const bulkActionsDeleteSelectorMock = jest.fn().mockReturnValue({
      isActionTriggered: true,
    })
    bulkActionsDeleteSelector.mockImplementation(bulkActionsDeleteSelectorMock)

    render(<BulkActionsConfig />)

    socket.on(BulkActionsServerEvent.Create, (data: any) => {
      expect(data).toEqual(deletingMock)
    })

    socket.socketClient.emit(SocketEvent.Connect)
    socket.socketClient.emit(BulkActionsServerEvent.Create, deletingMock)
  })

  it('should catch disconnect', () => {
    const bulkActionsSelectorMock = jest.fn().mockReturnValue({
      isConnected: true,
    })
    const bulkActionsDeleteSelectorMock = jest.fn().mockReturnValue({
      isActionTriggered: true,
    })
    bulkActionsSelector.mockImplementation(bulkActionsSelectorMock)
    bulkActionsDeleteSelector.mockImplementation(bulkActionsDeleteSelectorMock)

    const { unmount } = render(<BulkActionsConfig retryDelay={0} />)

    socket.socketClient.emit(SocketEvent.Connect)
    socket.socketClient.emit(SocketEvent.Disconnect)

    const afterRenderActions = [
      setBulkActionConnected(true),
      setBulkDeleteLoading(true),
      setDeleteOverviewStatus(BulkActionsStatus.Disconnected),
      disconnectBulkDeleteAction(),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })
})
