import React from 'react'
import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import {
  rdiPipelineSelector,
  setChangedFile,
  deleteChangedFile,
  setPipelineConfig,
  getPipelineStrategies,
} from 'uiSrc/slices/rdi/pipeline'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import {
  sendPageViewTelemetry,
  TelemetryPageView,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import Config from './Config'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    schema: { config: { test: {} } },
    data: null,
    config: `connections:
            target:
              type: redis
          `,
    jobs: [
      {
        name: 'jobName',
        value: `job:
      transform:
        type: sql
    `,
      },
      {
        name: 'job2',
        value: `job2:
      transform:
        type: redis
    `,
      },
    ],
  }),
}))

jest.mock('uiSrc/slices/rdi/testConnections', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/testConnections'),
  rdiTestConnectionsSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('Config', () => {
  it('should render', () => {
    expect(render(<Config />)).toBeTruthy()
  })

  it('should call proper sendPageViewTelemetry', () => {
    const sendPageViewTelemetryMock = jest.fn()
    ;(sendPageViewTelemetry as jest.Mock).mockImplementation(
      () => sendPageViewTelemetryMock,
    )

    render(<Config />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_CONFIG,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
      },
    })
  })

  it('should call proper actions', () => {
    render(<Config />)
    const fieldName = screen.getByTestId('rdi-monaco-config')
    fireEvent.change(fieldName, { target: { value: '123' } })

    const expectedActions = [
      setPipelineConfig('123'),
      setChangedFile({ name: 'config', status: FileChangeType.Added }),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions when value equal to deployed pipeline', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { config: { test: {} } },
      data: { config: '123' },
    })
    ;(rdiPipelineSelector as jest.Mock).mockImplementation(
      rdiPipelineSelectorMock,
    )

    render(<Config />)

    const fieldName = screen.getByTestId('rdi-monaco-config')
    fireEvent.change(fieldName, { target: { value: '123' } })

    const expectedActions = [
      getPipelineStrategies(),
      setPipelineConfig('123'),
      deleteChangedFile('config'),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions when value not equal to deployed pipeline', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { config: { test: {} } },
      data: { config: '11' },
    })
    ;(rdiPipelineSelector as jest.Mock).mockImplementation(
      rdiPipelineSelectorMock,
    )

    render(<Config />)

    const fieldName = screen.getByTestId('rdi-monaco-config')
    fireEvent.change(fieldName, { target: { value: '123' } })

    const expectedActions = [
      getPipelineStrategies(),
      setPipelineConfig('123'),
      setChangedFile({ name: 'config', status: FileChangeType.Modified }),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should open right panel', async () => {
    const { queryByTestId } = render(<Config />)

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('rdi-test-connection-btn'))
    })

    expect(queryByTestId('test-connection-panel')).toBeInTheDocument()
  })

  it('should close right panel', async () => {
    const { queryByTestId } = render(<Config />)

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('rdi-test-connection-btn'))
    })

    expect(queryByTestId('test-connection-panel')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('close-test-connections-btn'))
    })

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()
  })

  it('should render error notification', async () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      config: 'sources:incorrect\n target:',
    }))

    const { queryByTestId } = render(<Config />)

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('rdi-test-connection-btn'))
    })

    const expectedActions = [
      addErrorNotification({
        response: {
          data: {
            message: (
              <>
                Config has an invalid structure.
                <br />
                end of the stream or a document separator is expected
              </>
            ),
          },
        },
      } as AxiosError),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()
  })

  it('should render loading spinner', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    })
    ;(rdiPipelineSelector as jest.Mock).mockImplementation(
      rdiPipelineSelectorMock,
    )

    render(<Config />)

    expect(screen.getByTestId('rdi-config-loading')).toBeInTheDocument()
  })

  it('should render loader on btn', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    })
    ;(rdiPipelineSelector as jest.Mock).mockImplementation(
      rdiPipelineSelectorMock,
    )

    render(<Config />)

    // check is btn has loader
    expect(
      screen.getByTestId('rdi-test-connection-btn').children[0].children[0],
    ).toHaveClass('euiLoadingSpinner')
  })

  it('should render loader on btn', () => {
    const rdiTestConnectionsSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    })
    ;(rdiTestConnectionsSelector as jest.Mock).mockImplementation(
      rdiTestConnectionsSelectorMock,
    )

    render(<Config />)

    // check is btn has loader
    expect(
      screen.getByTestId('rdi-test-connection-btn').children[0].children[0],
    ).toHaveClass('euiLoadingSpinner')
  })

  it('should send telemetry event when clicking Test Connection button', async () => {
    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      sendEventTelemetryMock,
    )

    render(<Config />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('rdi-test-connection-btn'))
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.RDI_TEST_CONNECTIONS_CLICKED,
      eventData: {
        id: 'rdiInstanceId',
      },
    })
  })
})
