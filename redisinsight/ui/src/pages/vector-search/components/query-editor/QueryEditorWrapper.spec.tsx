import React from 'react'
import { render, screen, fireEvent, waitFor } from 'uiSrc/utils/test-utils'
import { QUERY_LIBRARY_ITEMS_MOCK } from 'uiSrc/mocks/handlers/browser/queryLibraryHandlers'

import { QueryEditorWrapper } from './QueryEditorWrapper'
import { EditorTab } from './QueryEditor.types'

jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      ReactMock.createElement(
        'div',
        { 'data-testid': 'code-editor' },
        props.value,
      ),
  }
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
const routerDom = require('react-router-dom')

const defaultProps = {
  query: '',
  setQuery: jest.fn(),
  onSubmit: jest.fn(),
}

const renderComponent = (props = {}) =>
  render(<QueryEditorWrapper {...defaultProps} {...props} />)

describe('QueryEditorWrapper', () => {
  const originalUseParams = routerDom.useParams
  const originalUseLocation = routerDom.useLocation

  beforeEach(() => {
    jest.clearAllMocks()

    routerDom.useParams = () => ({
      instanceId: 'instanceId',
      indexName: 'test-index',
    })

    routerDom.useLocation = () => ({
      pathname: 'pathname',
      search: '',
      state: null,
    })
  })

  afterAll(() => {
    routerDom.useParams = originalUseParams
    routerDom.useLocation = originalUseLocation
  })

  it('should render the editor wrapper', () => {
    renderComponent()

    const editorWrapper = screen.getByTestId('vector-search-query-editor')
    expect(editorWrapper).toBeInTheDocument()
  })

  it('should render editor/library toggle', () => {
    renderComponent()

    const toggle = screen.getByTestId('editor-library-toggle')
    expect(toggle).toBeInTheDocument()

    const editorBtn = screen.getByRole('button', { name: /Query editor/i })
    expect(editorBtn).toBeInTheDocument()

    const libraryBtn = screen.getByRole('button', { name: /Query library/i })
    expect(libraryBtn).toBeInTheDocument()
  })

  it('should render editor view by default', () => {
    renderComponent()

    const editor = screen.getByTestId('vector-search-editor')
    expect(editor).toBeInTheDocument()

    const actions = screen.getByTestId('vector-search-actions')
    expect(actions).toBeInTheDocument()
  })

  it('should switch to library view when Library toggle is clicked', async () => {
    renderComponent()

    const libraryBtn = screen.getByRole('button', { name: /Query library/i })
    fireEvent.click(libraryBtn)

    await waitFor(() => {
      const libraryView = screen.getByTestId('query-library-view')
      expect(libraryView).toBeInTheDocument()
    })

    const editor = screen.queryByTestId('vector-search-editor')
    expect(editor).not.toBeInTheDocument()
  })

  it('should switch back to editor view when Editor toggle is clicked', async () => {
    renderComponent()

    const libraryBtn = screen.getByRole('button', { name: /Query library/i })
    fireEvent.click(libraryBtn)

    await waitFor(() => {
      const editor = screen.queryByTestId('vector-search-editor')
      expect(editor).not.toBeInTheDocument()
    })

    const editorBtn = screen.getByRole('button', { name: /Query editor/i })
    fireEvent.click(editorBtn)

    const editor = screen.getByTestId('vector-search-editor')
    expect(editor).toBeInTheDocument()
  })

  it('should call onSubmit when Run is clicked on a library item', async () => {
    renderComponent()

    const libraryBtn = screen.getByRole('button', { name: /Query library/i })
    fireEvent.click(libraryBtn)

    await waitFor(() => {
      const item = screen.getByTestId(
        `query-library-item-${QUERY_LIBRARY_ITEMS_MOCK[0].id}`,
      )
      expect(item).toBeInTheDocument()
    })

    const runBtn = screen.getByTestId(
      `query-library-item-${QUERY_LIBRARY_ITEMS_MOCK[0].id}-run-btn`,
    )
    fireEvent.click(runBtn)

    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      QUERY_LIBRARY_ITEMS_MOCK[0].query,
    )
  })

  it('should switch to Editor tab and set query when Load is clicked', async () => {
    renderComponent()

    const libraryBtn = screen.getByRole('button', { name: /Query library/i })
    fireEvent.click(libraryBtn)

    await waitFor(() => {
      const item = screen.getByTestId(
        `query-library-item-${QUERY_LIBRARY_ITEMS_MOCK[0].id}`,
      )
      expect(item).toBeInTheDocument()
    })

    const loadBtn = screen.getByTestId(
      `query-library-item-${QUERY_LIBRARY_ITEMS_MOCK[0].id}-load-btn`,
    )
    fireEvent.click(loadBtn)

    expect(defaultProps.setQuery).toHaveBeenCalledWith(
      QUERY_LIBRARY_ITEMS_MOCK[0].query,
    )

    const editor = screen.getByTestId('vector-search-editor')
    expect(editor).toBeInTheDocument()
  })

  it('should open Library tab when location state has activeTab Library', async () => {
    routerDom.useLocation = () => ({
      pathname: 'pathname',
      search: '',
      state: { activeTab: EditorTab.Library },
    })

    renderComponent()

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search query')
      expect(searchInput).toBeInTheDocument()
    })

    const editor = screen.queryByTestId('vector-search-editor')
    expect(editor).not.toBeInTheDocument()
  })

  it('should default to Editor tab when location state has no activeTab', () => {
    routerDom.useLocation = () => ({
      pathname: 'pathname',
      search: '',
      state: null,
    })

    renderComponent()

    const editor = screen.getByTestId('vector-search-editor')
    expect(editor).toBeInTheDocument()

    const searchInput = screen.queryByPlaceholderText('Search query')
    expect(searchInput).not.toBeInTheDocument()
  })
})
