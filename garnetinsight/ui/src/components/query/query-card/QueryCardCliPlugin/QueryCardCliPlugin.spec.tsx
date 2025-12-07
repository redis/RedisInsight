import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { PluginEvents } from 'uiSrc/plugins/pluginEvents'
import { pluginApi } from 'uiSrc/services/PluginAPI'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { formatToText, replaceEmptyValue } from 'uiSrc/utils'
import {
  sendPluginCommandAction,
  getPluginStateAction,
  setPluginStateAction,
} from 'uiSrc/slices/app/plugins'
import QueryCardCliPlugin, { Props } from './QueryCardCliPlugin'

const mockedProps = mock<Props>()

jest.mock('uiSrc/services/PluginAPI', () => ({
  pluginApi: {
    onEvent: jest.fn(),
    sendEvent: jest.fn(),
  },
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  formatToText: jest.fn(),
  replaceEmptyValue: jest.fn(),
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [
      {
        id: '1',
        uniqId: '1',
        name: 'test',
        plugin: '',
        activationMethod: 'render',
        matchCommands: ['*'],
      },
    ],
  }),
  sendPluginCommandAction: jest.fn(),
  getPluginStateAction: jest.fn(),
  setPluginStateAction: jest.fn(),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('QueryCardCliPlugin', () => {
  it('should render', () => {
    expect(
      render(<QueryCardCliPlugin {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should subscribes on events', () => {
    const onEventMock = jest.fn()

    ;(pluginApi.onEvent as jest.Mock).mockImplementation(onEventMock)

    render(<QueryCardCliPlugin {...instance(mockedProps)} id="1" />)

    expect(onEventMock).toBeCalledWith(
      expect.any(String),
      PluginEvents.heightChanged,
      expect.any(Function),
    )
    expect(onEventMock).toBeCalledWith(
      expect.any(String),
      PluginEvents.loaded,
      expect.any(Function),
    )
    expect(onEventMock).toBeCalledWith(
      expect.any(String),
      PluginEvents.error,
      expect.any(Function),
    )
    expect(onEventMock).toBeCalledWith(
      expect.any(String),
      PluginEvents.setHeaderText,
      expect.any(Function),
    )
    expect(onEventMock).toBeCalledWith(
      expect.any(String),
      PluginEvents.executeRedisCommand,
      expect.any(Function),
    )
    expect(onEventMock).toBeCalledWith(
      expect.any(String),
      PluginEvents.getState,
      expect.any(Function),
    )
    expect(onEventMock).toBeCalledWith(
      expect.any(String),
      PluginEvents.setState,
      expect.any(Function),
    )
    expect(onEventMock).toBeCalledWith(
      expect.any(String),
      PluginEvents.formatRedisReply,
      expect.any(Function),
    )
  })

  it('should subscribes and call sendPluginCommandAction', () => {
    const mockedSendPluginCommandAction = jest
      .fn()
      .mockImplementation(() => jest.fn())
    ;(sendPluginCommandAction as jest.Mock).mockImplementation(
      mockedSendPluginCommandAction,
    )

    const onEventMock = jest
      .fn()
      .mockImplementation(
        (_iframeId: string, event: string, callback: (data: any) => void) => {
          if (event === PluginEvents.executeRedisCommand) {
            callback({ command: 'info' })
          }
        },
      )

    ;(pluginApi.onEvent as jest.Mock).mockImplementation(onEventMock)

    render(<QueryCardCliPlugin {...instance(mockedProps)} id="1" />)

    expect(mockedSendPluginCommandAction).toBeCalledWith({
      command: 'info',
      onSuccessAction: expect.any(Function),
      onFailAction: expect.any(Function),
    })
  })

  it('should subscribes and call getPluginStateAction with proper data', () => {
    const mockedGetPluginStateAction = jest
      .fn()
      .mockImplementation(() => jest.fn())
    ;(getPluginStateAction as jest.Mock).mockImplementation(
      mockedGetPluginStateAction,
    )

    const onEventMock = jest
      .fn()
      .mockImplementation(
        (_iframeId: string, event: string, callback: (data: any) => void) => {
          if (event === PluginEvents.getState) {
            callback({ requestId: 5 })
          }
        },
      )

    ;(pluginApi.onEvent as jest.Mock).mockImplementation(onEventMock)

    render(
      <QueryCardCliPlugin {...instance(mockedProps)} id="1" commandId="100" />,
    )

    expect(mockedGetPluginStateAction).toBeCalledWith({
      commandId: '100',
      onSuccessAction: expect.any(Function),
      onFailAction: expect.any(Function),
      visualizationId: '1',
    })
  })

  it('should subscribes and call setPluginStateAction with proper data', () => {
    const mockedSetPluginStateAction = jest
      .fn()
      .mockImplementation(() => jest.fn())
    ;(setPluginStateAction as jest.Mock).mockImplementation(
      mockedSetPluginStateAction,
    )

    const onEventMock = jest
      .fn()
      .mockImplementation(
        (_iframeId: string, event: string, callback: (data: any) => void) => {
          if (event === PluginEvents.setState) {
            callback({ requestId: 5 })
          }
        },
      )

    ;(pluginApi.onEvent as jest.Mock).mockImplementation(onEventMock)

    render(
      <QueryCardCliPlugin {...instance(mockedProps)} id="1" commandId="200" />,
    )

    expect(mockedSetPluginStateAction).toBeCalledWith({
      commandId: '200',
      onSuccessAction: expect.any(Function),
      onFailAction: expect.any(Function),
      visualizationId: '1',
    })
  })

  it('should subscribes and call formatToText', () => {
    const formatToTextMock = jest.fn()
    const replaceEmptyValueMock = jest.fn()
    ;(replaceEmptyValue as jest.Mock)
      .mockImplementation(replaceEmptyValueMock)
      .mockReturnValue([])
    ;(formatToText as jest.Mock).mockImplementation(formatToTextMock)
    const onEventMock = jest
      .fn()
      .mockImplementation(
        (_iframeId: string, event: string, callback: (dat: any) => void) => {
          if (event === PluginEvents.formatRedisReply) {
            callback({
              requestId: '1',
              data: { response: [], command: 'info' },
            })
          }
        },
      )

    ;(pluginApi.onEvent as jest.Mock).mockImplementation(onEventMock)

    render(<QueryCardCliPlugin {...instance(mockedProps)} id="1" />)

    expect(formatToTextMock).toBeCalledWith([], 'info')
  })

  it('should subscribes and call replaceEmptyValue', () => {
    const replaceEmptyValueMock = jest.fn()
    ;(replaceEmptyValue as jest.Mock).mockImplementation(replaceEmptyValueMock)
    const onEventMock = jest
      .fn()
      .mockImplementation(
        (_iframeId: string, event: string, callback: (dat: any) => void) => {
          if (event === PluginEvents.formatRedisReply) {
            callback({
              requestId: '1',
              data: { response: [], command: 'info' },
            })
          }
        },
      )

    ;(pluginApi.onEvent as jest.Mock).mockImplementation(onEventMock)

    render(<QueryCardCliPlugin {...instance(mockedProps)} id="1" />)

    expect(replaceEmptyValueMock).toBeCalledWith([])
  })
})
