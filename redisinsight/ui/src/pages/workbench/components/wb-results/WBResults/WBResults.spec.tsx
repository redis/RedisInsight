import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import WBResults, { Props } from './WBResults'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

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

describe('WBResults', () => {
  it('should render', () => {
    expect(render(<WBResults {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render NoResults component with empty items', () => {
    const { getByTestId } = render(
      <WBResults {...instance(mockedProps)} items={[]} isResultsLoaded />,
    )

    expect(getByTestId('wb_no-results')).toBeInTheDocument()
  })

  it('should not render NoResults component with empty items and loading state', () => {
    render(
      <WBResults
        {...instance(mockedProps)}
        items={[]}
        isResultsLoaded={false}
      />,
    )

    expect(screen.queryByTestId('wb_no-results')).not.toBeInTheDocument()
  })

  it('should render with custom props', () => {
    const itemsMock: CommandExecutionUI[] = [
      {
        id: '1',
        command: 'query1',
        result: [
          {
            response: 'data1',
            status: CommandExecutionStatus.Success,
          },
        ],
      },
      {
        id: '2',
        command: 'query2',
        result: [
          {
            response: 'data2',
            status: CommandExecutionStatus.Success,
          },
        ],
      },
    ]

    expect(
      render(<WBResults {...instance(mockedProps)} items={itemsMock} />),
    ).toBeTruthy()
  })

  it('should collect telemetry on query copy', () => {
    // TODO: Extract this a a facctory to avoid duplication
    const itemsMock: CommandExecutionUI[] = [
      {
        id: '1',
        command: 'query1',
        result: [
          {
            response: 'data1',
            status: CommandExecutionStatus.Success,
          },
        ],
      },
    ]

    render(
      <WBResults
        {...instance(mockedProps)}
        items={itemsMock}
        isResultsLoaded={false}
      />,
    )

    // Find and click the "Copy" button
    const copyButton = screen.getByTestId('copy-command')
    expect(copyButton).toBeInTheDocument()

    fireEvent.click(copyButton)

    // Verify telemetry event was sent
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_COMMAND_COPIED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        command: itemsMock[0].command,
      },
    })
  })
})
