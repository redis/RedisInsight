import React from 'react'
import { render, screen } from '@testing-library/react'

import {
  QueryEditorContextProvider,
  useQueryEditorContext,
} from './query-editor.context'

const mockContextValue = {
  query: 'FT.SEARCH idx "*"',
  setQuery: jest.fn(),
  isLoading: false,
  commands: [],
  indexes: [],
  onSubmit: jest.fn(),
}

const TestComponent: React.FC = () => {
  const { query, isLoading } = useQueryEditorContext()

  return (
    <div>
      <p data-testid="query">{query}</p>
      <p data-testid="is-loading">{String(isLoading)}</p>
    </div>
  )
}

describe('QueryEditorContext', () => {
  it('provides default values', () => {
    render(
      <QueryEditorContextProvider value={mockContextValue}>
        <TestComponent />
      </QueryEditorContextProvider>,
    )

    expect(screen.getByTestId('query')).toHaveTextContent('FT.SEARCH idx "*"')
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
  })

  it('provides custom values', () => {
    render(
      <QueryEditorContextProvider
        value={{ ...mockContextValue, query: 'PING', isLoading: true }}
      >
        <TestComponent />
      </QueryEditorContextProvider>,
    )

    expect(screen.getByTestId('query')).toHaveTextContent('PING')
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true')
  })

  it('provides monacoObjects ref', () => {
    const RefTestComponent: React.FC = () => {
      const { monacoObjects } = useQueryEditorContext()
      return <p data-testid="has-ref">{String(monacoObjects !== undefined)}</p>
    }

    render(
      <QueryEditorContextProvider value={mockContextValue}>
        <RefTestComponent />
      </QueryEditorContextProvider>,
    )

    expect(screen.getByTestId('has-ref')).toHaveTextContent('true')
  })
})
