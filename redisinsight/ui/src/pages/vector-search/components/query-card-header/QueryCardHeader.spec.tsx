import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  mockedStore,
  render,
  fireEvent,
  act,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import QueryCardHeader, { HIDE_FIELDS, Props } from './QueryCardHeader'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
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
        matchCommands: ['FT.SEARCH'],
      },
    ],
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('QueryCardHeader', () => {
  it('should render', () => {
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendCliClusterActionMock = jest.fn();

    // sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock);

    expect(render(<QueryCardHeader {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should render tooltip in milliseconds', async () => {
    render(
      <QueryCardHeader
        {...instance(mockedProps)}
        executionTime={12345678910}
      />,
    )

    await act(async () => {
      fireEvent.focus(screen.getByTestId('command-execution-time-icon'))
    })
    await waitForRiTooltipVisible()

    expect(screen.getByTestId('execution-time-tooltip')).toHaveTextContent(
      '12 345 678.91 msec',
    )
  })

  it('should render disabled copy button', async () => {
    render(<QueryCardHeader {...instance(mockedProps)} emptyCommand />)

    expect(screen.getByTestId('copy-command')).toBeDisabled()
  })

  it('should hide Profiler button', async () => {
    render(
      <QueryCardHeader
        {...instance(mockedProps)}
        query="FT.GET something"
        isOpen
        hideFields={[HIDE_FIELDS.profiler]}
      />,
    )

    expect(screen.queryByTestId('run-profile-type')).not.toBeInTheDocument()
  })

  it('should hide Change View Type button', async () => {
    render(
      <QueryCardHeader
        {...instance(mockedProps)}
        query="FT.SEARCH index somethingCool"
        isOpen
        hideFields={[HIDE_FIELDS.viewType]}
      />,
    )

    expect(screen.queryByTestId('select-view-type')).not.toBeInTheDocument()
  })

  it('event telemetry SEARCH_COMMAND_COPIED should be call after click on copy btn', async () => {
    const command = 'info'
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(<QueryCardHeader {...instance(mockedProps)} query={command} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-command'))
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_COPIED,
      eventData: {
        command,
        databaseId: INSTANCE_ID_MOCK,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
