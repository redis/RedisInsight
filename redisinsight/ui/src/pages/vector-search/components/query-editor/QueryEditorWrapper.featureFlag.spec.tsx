import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { isVectorSearchEnhancementsEnabledSelector } from 'uiSrc/slices/app/features'

import { QueryEditorWrapper } from './QueryEditorWrapper'

// Stub the monaco-backed editor and embedding highlight so the test only
// asserts whether the highlight is rendered, not how it behaves.
jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: () =>
      ReactMock.createElement('div', { 'data-testid': 'code-editor' }),
  }
})

jest.mock('uiSrc/components/query', () => {
  const ReactMock = require('react')
  return {
    ...jest.requireActual('uiSrc/components/query'),
    VectorEmbeddingHighlight: () =>
      ReactMock.createElement('div', {
        'data-testid': 'vector-embedding-highlight',
      }),
  }
})

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  isVectorSearchEnhancementsEnabledSelector: jest.fn(() => false),
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const routerDom = require('react-router-dom')

const mockEnhancementsEnabled = jest.mocked(
  isVectorSearchEnhancementsEnabledSelector,
)

const renderComponent = () =>
  render(
    <QueryEditorWrapper query="" setQuery={jest.fn()} onSubmit={jest.fn()} />,
  )

describe('QueryEditorWrapper > vector embedding highlight gating', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    routerDom.useParams = () => ({ instanceId: 'instanceId', indexName: 'idx' })
    routerDom.useLocation = () => ({
      pathname: 'pathname',
      search: '',
      state: {},
    })
  })

  it('renders the embedding highlight when dev-vs-enhancements is on', () => {
    mockEnhancementsEnabled.mockReturnValue(true)

    renderComponent()

    expect(screen.getByTestId('vector-embedding-highlight')).toBeInTheDocument()
  })

  it('hides the embedding highlight when dev-vs-enhancements is off', () => {
    mockEnhancementsEnabled.mockReturnValue(false)

    renderComponent()

    expect(
      screen.queryByTestId('vector-embedding-highlight'),
    ).not.toBeInTheDocument()
  })
})
