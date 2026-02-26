import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import {
  QueryResultsProvider,
  useQueryResultsContext,
  QueryResultsTelemetry,
} from './query-results.context'

const TestComponent: React.FC = () => {
  const { telemetry } = useQueryResultsContext()

  return (
    <div>
      <button
        data-testid="copy-btn"
        onClick={() =>
          telemetry.onCommandCopied?.({
            command: 'GET key',
            databaseId: 'db-1',
          })
        }
      />
    </div>
  )
}

describe('QueryResultsContext', () => {
  it('does not throw when no telemetry is provided', () => {
    render(
      <QueryResultsProvider>
        <TestComponent />
      </QueryResultsProvider>,
    )

    expect(() => fireEvent.click(screen.getByTestId('copy-btn'))).not.toThrow()
  })

  it('invokes the telemetry callback when provided', () => {
    const telemetry: QueryResultsTelemetry = {
      onCommandCopied: jest.fn(),
    }

    render(
      <QueryResultsProvider telemetry={telemetry}>
        <TestComponent />
      </QueryResultsProvider>,
    )

    fireEvent.click(screen.getByTestId('copy-btn'))

    expect(telemetry.onCommandCopied).toHaveBeenCalledWith({
      command: 'GET key',
      databaseId: 'db-1',
    })
  })
})
