import React from 'react'
import { render, screen } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import {
  useViewModeContext,
  ViewMode,
  ViewModeContextProvider,
} from './view-mode.context'

// Test component to consume the context
const TestComponent: React.FC = () => {
  const { viewMode, setViewMode } = useViewModeContext()

  return (
    <div>
      <p data-testid="view-mode">Current View Mode: {viewMode}</p>
      <button onClick={() => setViewMode(ViewMode.VectorSearch)}>
        Set to Vector Search
      </button>
      <button onClick={() => setViewMode(ViewMode.Workbench)}>
        Set to Workbench
      </button>
    </div>
  )
}

describe('ViewModeContext', () => {
  it('provides the default view mode', () => {
    render(
      <ViewModeContextProvider>
        <TestComponent />
      </ViewModeContextProvider>,
    )

    expect(screen.getByTestId('view-mode')).toHaveTextContent(
      `Current View Mode: ${ViewMode.Workbench}`,
    )
  })

  it('allows setting the view mode', async () => {
    const user = userEvent.setup()

    render(
      <ViewModeContextProvider>
        <TestComponent />
      </ViewModeContextProvider>,
    )

    const vectorSearchButton = screen.getByText('Set to Vector Search')
    const workbenchButton = screen.getByText('Set to Workbench')

    // Change to Vector Search
    await user.click(vectorSearchButton)
    expect(screen.getByTestId('view-mode')).toHaveTextContent(
      `Current View Mode: ${ViewMode.VectorSearch}`,
    )

    // Change back to Workbench
    await user.click(workbenchButton)
    expect(screen.getByTestId('view-mode')).toHaveTextContent(
      `Current View Mode: ${ViewMode.Workbench}`,
    )
  })

  it('uses the initial view mode if provided', () => {
    render(
      <ViewModeContextProvider initialViewMode={ViewMode.VectorSearch}>
        <TestComponent />
      </ViewModeContextProvider>,
    )

    expect(screen.getByTestId('view-mode')).toHaveTextContent(
      `Current View Mode: ${ViewMode.VectorSearch}`,
    )
  })

  it('throws an error if used outside the provider', () => {
    const renderWithoutProvider = () => {
      render(<TestComponent />)
    }

    expect(renderWithoutProvider).toThrow(
      'useViewModeContext must be used within a ViewModeContextProvider',
    )
  })
})
