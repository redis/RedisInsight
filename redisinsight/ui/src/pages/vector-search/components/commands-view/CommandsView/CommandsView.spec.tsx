import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { RunQueryMode } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import CommandsView, { Props } from './CommandsView'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderCommandsViewComponent = (props?: Partial<Props>) => {
  const defaultProps: Props = {
    isResultsLoaded: true,
    items: commandExecutionUIFactory.buildList(1),
    clearing: true,
    processing: false,
    activeMode: RunQueryMode.ASCII,
    scrollDivRef: React.createRef<HTMLDivElement>(),
    onQueryReRun: jest.fn(),
    onQueryDelete: jest.fn(),
    onAllQueriesDelete: jest.fn(),
    onQueryOpen: jest.fn(),
    onQueryProfile: jest.fn(),
  }

  return render(<CommandsView {...defaultProps} {...props} />)
}

describe('CommandsView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    const { container } = renderCommandsViewComponent()
    expect(container).toBeInTheDocument()

    // TODO: Verify the rendered content
  })

  describe('Telemetry', () => {
    it('should collect telemetry when clicking the re-run button', () => {
      const mockCommand = commandExecutionUIFactory.build()
      const props: Partial<Props> = {
        items: [mockCommand],
        onQueryReRun: jest.fn(),
      }

      renderCommandsViewComponent(props)

      const reRunButton = screen.getByTestId('re-run-command')
      expect(reRunButton).toBeInTheDocument()

      fireEvent.click(reRunButton)

      // Verify telemetry event was sent
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          commands: [mockCommand.command],
        },
      })
    })
  })
})
