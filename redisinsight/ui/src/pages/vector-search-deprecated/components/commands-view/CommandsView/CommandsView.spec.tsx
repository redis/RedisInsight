import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { RunQueryMode } from 'uiSrc/slices/interfaces'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import {
  QueryResultsProvider,
  QueryResultsTelemetry,
} from 'uiSrc/components/query/context/query-results.context'
import CommandsView, { Props } from './CommandsView'

const mockTelemetry: QueryResultsTelemetry = {
  onCommandCopied: jest.fn(),
  onResultCleared: jest.fn(),
  onResultCollapsed: jest.fn(),
  onResultExpanded: jest.fn(),
  onResultViewChanged: jest.fn(),
  onFullScreenToggled: jest.fn(),
  onQueryReRun: jest.fn(),
}

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

  return render(
    <QueryResultsProvider telemetry={mockTelemetry}>
      <CommandsView {...defaultProps} {...props} />
    </QueryResultsProvider>,
  )
}

describe('CommandsView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    const { container } = renderCommandsViewComponent()
    expect(container).toBeInTheDocument()
  })

  describe('Telemetry', () => {
    it('should call telemetry onQueryReRun when clicking the re-run button', () => {
      const mockCommand = commandExecutionUIFactory.build({
        isOpen: false,
        emptyCommand: false,
      })

      const props: Partial<Props> = {
        items: [mockCommand],
        onQueryReRun: jest.fn(),
      }

      renderCommandsViewComponent(props)

      const reRunButton = screen.getByTestId('re-run-command')
      expect(reRunButton).toBeInTheDocument()

      fireEvent.click(reRunButton)

      expect(mockTelemetry.onQueryReRun).toHaveBeenCalled()
    })
  })
})
