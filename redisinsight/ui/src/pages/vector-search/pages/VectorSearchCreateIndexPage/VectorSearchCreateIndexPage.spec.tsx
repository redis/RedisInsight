import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cleanup, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { VectorSearchCreateIndexPage } from './VectorSearchCreateIndexPage'

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useCreateIndexCommand: jest.fn(() => ({
    command: 'FT.CREATE idx:bikes_vss ...',
    indexName: 'idx:bikes_vss',
  })),
  useCreateIndexFlow: jest.fn(() => ({
    run: jest.fn(),
    loading: false,
  })),
  useRedisearchListData: jest.fn(() => ({
    stringData: [],
  })),
  useIndexNameValidation: jest.fn(() => null),
  useLoadKeyData: jest.fn(() => ({
    loadKeyData: jest.fn(),
    fields: [],
    loading: false,
    error: null,
  })),
}))

jest.mock('../../components/index-details', () => {
  const MockReact = require('react')
  return {
    IndexDetails: () =>
      MockReact.createElement(
        'div',
        { 'data-testid': 'index-details-container' },
        'IndexDetails',
      ),
  }
})

jest.mock('../../components/command-view', () => {
  const MockReact = require('react')
  return {
    CommandView: (props: any) =>
      MockReact.createElement(
        'div',
        { 'data-testid': props.dataTestId },
        'CommandView',
      ),
  }
})

const mockPush = jest.fn()

const setupRouterMocks = (sampleData?: string) => {
  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })
  reactRouterDom.useParams = jest
    .fn()
    .mockReturnValue({ instanceId: 'test-instance' })
  reactRouterDom.useLocation = jest.fn().mockReturnValue({
    state: sampleData ? { sampleData } : undefined,
    pathname: '/test-instance/vector-search/create-index',
    search: '',
    hash: '',
  })
}

describe('VectorSearchCreateIndexPage', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render all page elements', () => {
    setupRouterMocks('e-commerce-discovery')

    render(<VectorSearchCreateIndexPage />)

    const page = screen.getByTestId('vector-search--create-index--page')
    const card = screen.getByTestId('vector-search--create-index--card')
    const title = screen.getByTestId('vector-search--create-index--title')
    const viewToggle = screen.getByTestId(
      'vector-search--create-index--view-toggle',
    )
    const tableViewBtn = screen.getByTestId(
      'vector-search--create-index--table-view-btn',
    )
    const commandViewBtn = screen.getByTestId(
      'vector-search--create-index--command-view-btn',
    )
    const addFieldBtn = screen.getByTestId(
      'vector-search--create-index--add-field-btn',
    )
    const prefixValue = screen.getByTestId(
      'vector-search--create-index--prefix-value',
    )
    const indexDetails = screen.getByTestId('index-details-container')
    const submitBtn = screen.getByTestId(
      'vector-search--create-index--submit-btn',
    )
    const cancelBtn = screen.getByTestId(
      'vector-search--create-index--cancel-btn',
    )

    expect(page).toBeInTheDocument()
    expect(card).toBeInTheDocument()
    expect(title).toHaveTextContent(
      'View sample data index: E-commerce discovery',
    )
    expect(viewToggle).toBeInTheDocument()
    expect(tableViewBtn).toBeInTheDocument()
    expect(commandViewBtn).toBeInTheDocument()
    expect(addFieldBtn).toBeInTheDocument()
    expect(addFieldBtn).toBeDisabled()
    expect(prefixValue).toHaveTextContent('bikes:')
    expect(indexDetails).toBeInTheDocument()
    expect(submitBtn).toBeInTheDocument()
    expect(cancelBtn).toBeInTheDocument()
  })

  it('should switch to command view when clicking Command view button', () => {
    setupRouterMocks('e-commerce-discovery')

    render(<VectorSearchCreateIndexPage />)

    const commandViewBtn = screen.getByTestId(
      'vector-search--create-index--command-view-btn',
    )

    fireEvent.click(commandViewBtn)

    const commandView = screen.getByTestId(
      'vector-search--create-index--command-view',
    )
    const indexDetails = screen.queryByTestId('index-details-container')

    expect(commandView).toBeInTheDocument()
    expect(indexDetails).not.toBeInTheDocument()
  })

  it('should navigate back on cancel', () => {
    setupRouterMocks('e-commerce-discovery')

    render(<VectorSearchCreateIndexPage />)

    const cancelBtn = screen.getByTestId(
      'vector-search--create-index--cancel-btn',
    )

    fireEvent.click(cancelBtn)

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('vector-search'),
    )
  })
})
