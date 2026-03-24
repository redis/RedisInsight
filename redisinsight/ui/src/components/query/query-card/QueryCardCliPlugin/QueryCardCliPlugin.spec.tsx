import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { PluginEvents } from 'uiSrc/plugins/pluginEvents'
import { pluginApi } from 'uiSrc/services/PluginAPI'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { formatToText, replaceEmptyValue } from 'uiSrc/utils'
import {
  appPluginsSelector,
  sendPluginCommandAction,
  getPluginStateAction,
  setPluginStateAction,
} from 'uiSrc/slices/app/plugins'
import * as tsResultPreferences from 'uiSrc/pages/workbench/utils/tsResultPreferences'
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

jest.mock('uiSrc/pages/workbench/utils/tsResultPreferences', () => ({
  ...jest.requireActual('uiSrc/pages/workbench/utils/tsResultPreferences'),
  getWbTsResultPreferences: jest.fn().mockReturnValue(undefined),
  mergeWbTsChartPreferences: jest.fn(),
}))

const mockAppPluginsSelector = appPluginsSelector as jest.Mock
const mockPluginApiOnEvent = pluginApi.onEvent as jest.Mock
const mockSetPluginStateAction = setPluginStateAction as jest.Mock
const mockGetWbTsResultPreferences =
  tsResultPreferences.getWbTsResultPreferences as jest.Mock
const mockMergeWbTsChartPreferences =
  tsResultPreferences.mergeWbTsChartPreferences as jest.Mock

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

  describe('TimeSeries dual-write', () => {
    afterEach(() => {
      mockAppPluginsSelector.mockReturnValue({
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
      })
    })

    it('should call mergeWbTsChartPreferences on setState for redistimeseries-chart', () => {
      mockAppPluginsSelector.mockReturnValue({
        visualizations: [
          {
            id: 'redistimeseries-chart',
            uniqId: 'redistimeseries__redistimeseries-chart',
            name: 'Chart',
            plugin: { name: 'redistimeseries' },
            activationMethod: 'renderChart',
            matchCommands: ['TS.RANGE'],
            default: true,
          },
        ],
      })

      const setStateMock = jest.fn().mockImplementation(() => jest.fn())
      mockSetPluginStateAction.mockImplementation(setStateMock)

      const mockState = { mode: 'points', fill: false }
      const onEventMock = jest
        .fn()
        .mockImplementation(
          (_iframeId: string, event: string, callback: (data: any) => void) => {
            if (event === PluginEvents.setState) {
              callback({ requestId: 5, state: mockState })
            }
          },
        )
      mockPluginApiOnEvent.mockImplementation(onEventMock)

      render(
        <QueryCardCliPlugin
          {...instance(mockedProps)}
          id="redistimeseries__redistimeseries-chart"
          commandId="300"
        />,
      )

      expect(mockMergeWbTsChartPreferences).toHaveBeenCalledWith(
        'instanceId',
        mockState,
      )
    })

    it('should inject initialPreferences into executeCommand payload for TS plugin', () => {
      mockAppPluginsSelector.mockReturnValue({
        visualizations: [
          {
            id: 'redistimeseries-chart',
            uniqId: 'redistimeseries__redistimeseries-chart',
            name: 'Chart',
            plugin: {
              name: 'redistimeseries',
              baseUrl: '/plugins/redistimeseries',
              scriptSrc: '/plugins/redistimeseries/index.js',
              stylesSrc: '/plugins/redistimeseries/styles.css',
            },
            activationMethod: 'renderChart',
            matchCommands: ['TS.RANGE'],
            default: true,
          },
        ],
        staticPath: '/static',
      })

      const chartConfig = { mode: 'points' as const, fill: false }
      mockGetWbTsResultPreferences.mockReturnValue({
        selectedView: 'plugin:redistimeseries-chart' as const,
        chartConfig,
      })

      const createEventSpy = jest.spyOn(document, 'createEvent')

      mockPluginApiOnEvent.mockImplementation(
        (_iframeId: string, event: string, callback: (data?: any) => void) => {
          if (event === PluginEvents.loaded) {
            callback()
          }
        },
      )

      render(
        <QueryCardCliPlugin
          {...instance(mockedProps)}
          id="redistimeseries__redistimeseries-chart"
          commandId="500"
          result={[{ response: 'data', status: 'success' }] as any}
          query="TS.RANGE key - +"
        />,
      )

      const executeCommandEvent = createEventSpy.mock.results.find(
        (r) => r.value?.data?.event === 'executeCommand',
      )

      expect(executeCommandEvent).toBeDefined()
      expect(executeCommandEvent!.value.data.data.initialPreferences).toEqual({
        chartConfig,
      })

      createEventSpy.mockRestore()
    })

    it('should not call mergeWbTsChartPreferences for non-TimeSeries plugin', () => {
      mockMergeWbTsChartPreferences.mockClear()

      const setStateMock = jest.fn().mockImplementation(() => jest.fn())
      mockSetPluginStateAction.mockImplementation(setStateMock)

      const onEventMock = jest
        .fn()
        .mockImplementation(
          (_iframeId: string, event: string, callback: (data: any) => void) => {
            if (event === PluginEvents.setState) {
              callback({ requestId: 5, state: { some: 'state' } })
            }
          },
        )
      mockPluginApiOnEvent.mockImplementation(onEventMock)

      render(
        <QueryCardCliPlugin
          {...instance(mockedProps)}
          id="1"
          commandId="300"
        />,
      )

      expect(mockMergeWbTsChartPreferences).not.toHaveBeenCalled()
    })
  })
})
