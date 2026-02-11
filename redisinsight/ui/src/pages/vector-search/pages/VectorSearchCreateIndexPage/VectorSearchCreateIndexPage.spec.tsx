import React from 'react'
import { cleanup, render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { VectorSearchCreateIndexPage } from './VectorSearchCreateIndexPage'

jest.mock('../../hooks/useCreateIndex', () => ({
  useCreateIndex: () => ({
    run: jest.fn(),
    loading: false,
    error: null,
    success: false,
  }),
}))

jest.mock('../../hooks/useRedisearchListData', () => ({
  useRedisearchListData: () => ({
    loading: false,
    data: [],
    stringData: [],
  }),
}))

const mockPush = jest.fn()

const setupRouterMocks = (state?: Record<string, unknown>) => {
  const routerDom = require('react-router-dom')
  routerDom.useLocation = () => ({
    state: state ?? { sampleData: 'e-commerce-discovery' },
    pathname: '/test-instance/vector-search/create-index',
    search: '',
    hash: '',
  })
  routerDom.useHistory = () => ({
    push: mockPush,
    replace: jest.fn(),
    location: { pathname: '' },
    listen: jest.fn(),
    goBack: jest.fn(),
  })
  routerDom.useParams = () => ({ instanceId: 'test-instance' })
  routerDom.Redirect = () => null
}

describe('VectorSearchCreateIndexPage', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render all page elements', () => {
    setupRouterMocks()

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
    setupRouterMocks()

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
    setupRouterMocks()

    render(<VectorSearchCreateIndexPage />)

    const cancelBtn = screen.getByTestId(
      'vector-search--create-index--cancel-btn',
    )

    fireEvent.click(cancelBtn)

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('vector-search'),
    )
  })

  it('should not render page content when no sampleData in state', () => {
    setupRouterMocks(undefined)
    const routerDom = require('react-router-dom')
    routerDom.useLocation = () => ({
      state: undefined,
      pathname: '/test-instance/vector-search/create-index',
      search: '',
      hash: '',
    })

    render(<VectorSearchCreateIndexPage />)

    const page = screen.queryByTestId('vector-search--create-index--page')

    expect(page).not.toBeInTheDocument()
  })
})
