import React from 'react'
import { render, screen } from '@testing-library/react'

import {
  useViewModeContext,
  ViewMode,
  ViewModeContextProvider,
} from './view-mode.context'

// Test component to consume the context
const TestComponent: React.FC = () => {
  const { viewMode } = useViewModeContext()

  return (
    <div>
      <p data-testid="view-mode">Current View Mode: {viewMode}</p>
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

  it('uses the initial view mode if provided', () => {
    render(
      <ViewModeContextProvider viewMode={ViewMode.VectorSearch}>
        <TestComponent />
      </ViewModeContextProvider>,
    )

    expect(screen.getByTestId('view-mode')).toHaveTextContent(
      `Current View Mode: ${ViewMode.VectorSearch}`,
    )
  })
})
