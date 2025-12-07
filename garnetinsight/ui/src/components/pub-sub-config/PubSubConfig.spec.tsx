/* eslint-disable sonarjs/no-duplicate-string */
import { cloneDeep } from 'lodash'
import React from 'react'
import MockedSocket from 'socket.io-mock'
import socketIO from 'socket.io-client'
import { PubSubEvent, SubscriptionType } from 'uiSrc/constants/pubSub'
import {
  disconnectPubSub,
  pubSubSelector,
  setLoading,
  setPubSubConnected,
} from 'uiSrc/slices/pubsub/pubsub'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { SocketEvent } from 'uiSrc/constants'
import * as ioHooks from 'uiSrc/services/hooks/useIoConnection'
import { getSocketApiUrl } from 'uiSrc/utils'
import PubSubConfig from './PubSubConfig'

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

jest.mock('uiSrc/slices/pubsub/pubsub', () => ({
  ...jest.requireActual('uiSrc/slices/pubsub/pubsub'),
  pubSubSelector: jest.fn().mockReturnValue({
    isConnected: false,
    isSubscribed: false,
    isSubscribeTriggered: false,
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1',
  }),
}))

const subscriptionsMock = [{ channel: 'p*', type: SubscriptionType.PSubscribe }]

describe('PubSubConfig', () => {
  it('should render', () => {
    expect(render(<PubSubConfig />)).toBeTruthy()
  })

  it('should connect socket', () => {
    const pubSubSelectorMock = jest.fn().mockReturnValue({
      isSubscribeTriggered: true,
    })
    pubSubSelector.mockImplementation(pubSubSelectorMock)

    render(<PubSubConfig />)

    socket.socketClient.emit(SocketEvent.Connect)

    const afterRenderActions = [setPubSubConnected(true), setLoading(true)]
    expect(store.getActions()).toEqual([...afterRenderActions])
    expect(useIoConnectionSpy).toHaveBeenCalledWith(
      getSocketApiUrl('pub-sub'),
      { query: { instanceId: '1' }, token: '' },
    )
  })

  it('should emit subscribe on channel', () => {
    const pubSubSelectorMock = jest.fn().mockReturnValue({
      isSubscribeTriggered: true,
      subscriptions: subscriptionsMock,
    })
    pubSubSelector.mockImplementation(pubSubSelectorMock)

    render(<PubSubConfig />)

    socket.on(PubSubEvent.Subscribe, (data: any) => {
      expect(data).toEqual(subscriptionsMock)
    })

    socket.socketClient.emit(SocketEvent.Connect)
    socket.socketClient.emit(PubSubEvent.Subscribe, subscriptionsMock)
  })

  it('should catch disconnect', () => {
    const pubSubSelectorMock = jest.fn().mockReturnValue({
      isSubscribeTriggered: true,
      isConnected: true,
      isSubscribed: true,
    })
    pubSubSelector.mockImplementation(pubSubSelectorMock)

    const { unmount } = render(<PubSubConfig retryDelay={0} />)

    socket.socketClient.emit(SocketEvent.Connect)
    socket.socketClient.emit(SocketEvent.Disconnect)

    const afterRenderActions = [
      setPubSubConnected(true),
      setLoading(true),
      disconnectPubSub(),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])

    unmount()
  })
})
