import React from 'react'
import { act, render, screen } from 'uiSrc/utils/test-utils'

import { PageContent } from './PageContent'
import { PageContentProps } from './PageContent.types'

jest.mock('../../../../hooks/useIndexInfo/useIndexInfo', () => ({
  useIndexInfo: jest.fn().mockReturnValue({
    indexInfo: null,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

jest.mock('uiSrc/services/commands-history/commandsHistoryService', () => ({
  CommandsHistoryService: jest.fn().mockImplementation(() => ({
    getCommandsHistory: jest.fn().mockResolvedValue([]),
    getCommandHistory: jest.fn().mockResolvedValue(null),
    addCommandsToHistory: jest.fn().mockResolvedValue([]),
    deleteCommandFromHistory: jest.fn().mockResolvedValue(undefined),
    clearCommandsHistory: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: [],
  }),
}))

describe('PageContent', () => {
  const defaultProps: PageContentProps = {
    isIndexPanelOpen: false,
    onCloseIndexPanel: jest.fn(),
  }

  const renderComponent = async (propsOverride?: Partial<PageContentProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    let result: ReturnType<typeof render>
    await act(async () => {
      result = render(<PageContent {...props} />)
    })
    return result!
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render editor and query results', async () => {
    await renderComponent()

    const editor = screen.getByTestId('vector-search-query-editor')
    const results = screen.getByTestId('query-results')

    expect(editor).toBeInTheDocument()
    expect(results).toBeInTheDocument()
  })

  it('should not render index panel when closed', async () => {
    await renderComponent({ isIndexPanelOpen: false })

    const panel = screen.queryByTestId('view-index-panel')
    expect(panel).not.toBeInTheDocument()
  })

  it('should render index panel when open', async () => {
    await renderComponent({ isIndexPanelOpen: true })

    const panel = screen.getByTestId('view-index-panel')
    expect(panel).toBeInTheDocument()
  })
})
