import React from 'react'
import reactRouterDom from 'react-router-dom'
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from 'uiSrc/utils/test-utils'

import { VectorSearchCreateIndexPage } from './VectorSearchCreateIndexPage'
import { useHasExistingKeys } from '../../hooks/useHasExistingKeys'

jest.mock('../../hooks/useHasExistingKeys', () => ({
  useHasExistingKeys: jest.fn(),
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
        props.command ?? 'CommandView',
      ),
  }
})

const mockPush = jest.fn()

const setupRouterMocks = (search: string) => {
  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })
  reactRouterDom.useParams = jest
    .fn()
    .mockReturnValue({ instanceId: 'test-instance' })
  reactRouterDom.useLocation = jest.fn().mockReturnValue({
    pathname: '/test-instance/vector-search/create-index',
    search,
    hash: '',
  })
}

const mockUseHasExistingKeys = (
  overrides: Partial<ReturnType<typeof useHasExistingKeys>> = {},
) => {
  jest.mocked(useHasExistingKeys).mockReturnValue({
    hasKeys: true,
    loading: false,
    ...overrides,
  })
}

describe('VectorSearchCreateIndexPage', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    mockUseHasExistingKeys()
  })

  it('should render all page elements', () => {
    setupRouterMocks('?sampleData=e-commerce-discovery')

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
    setupRouterMocks('?sampleData=e-commerce-discovery')

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
    setupRouterMocks('?sampleData=e-commerce-discovery')

    render(<VectorSearchCreateIndexPage />)

    const cancelBtn = screen.getByTestId(
      'vector-search--create-index--cancel-btn',
    )

    fireEvent.click(cancelBtn)

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('vector-search'),
    )
  })

  describe('existing data mode with no keys in the database', () => {
    it('should show a loader while checking for existing keys', () => {
      setupRouterMocks('?mode=existingData')
      mockUseHasExistingKeys({ hasKeys: false, loading: true })

      render(<VectorSearchCreateIndexPage />)

      expect(
        screen.getByTestId('vector-search--create-index--loading'),
      ).toBeInTheDocument()
    })

    it('should hide the key browser and render the manual creation empty state', () => {
      setupRouterMocks('?mode=existingData')
      mockUseHasExistingKeys({ hasKeys: false })

      render(<VectorSearchCreateIndexPage />)

      const browserPanel = screen.queryByTestId(
        'vector-search--create-index--browser-panel',
      )
      expect(browserPanel).not.toBeInTheDocument()

      const emptyState = screen.getByTestId(
        'vector-search--create-index--empty-state',
      )
      expect(emptyState).toHaveTextContent(
        'Build your search index by manually adding the fields you want to index.',
      )

      const addFieldBtn = screen.getByTestId(
        'vector-search--create-index--add-field-btn',
      )
      expect(addFieldBtn).toBeEnabled()

      const prefixInput = screen.getByTestId(
        'vector-search--create-index--prefix-input',
      )
      expect(prefixInput).toBeInTheDocument()

      const submitBtn = screen.getByTestId(
        'vector-search--create-index--submit-btn',
      )
      expect(submitBtn).toBeDisabled()
    })

    it('should show the command view before any fields are added', () => {
      setupRouterMocks('?mode=existingData')
      mockUseHasExistingKeys({ hasKeys: false })

      render(<VectorSearchCreateIndexPage />)

      fireEvent.click(
        screen.getByTestId('vector-search--create-index--command-view-btn'),
      )

      const commandView = screen.getByTestId(
        'vector-search--create-index--command-view',
      )
      expect(commandView).toBeInTheDocument()
      expect(
        screen.queryByTestId('vector-search--create-index--empty-state'),
      ).not.toBeInTheDocument()

      fireEvent.click(
        screen.getByTestId('vector-search--create-index--table-view-btn'),
      )

      expect(
        screen.getByTestId('vector-search--create-index--empty-state'),
      ).toBeInTheDocument()
    })

    it('should build the command with the chosen key type', async () => {
      setupRouterMocks('?mode=existingData')
      mockUseHasExistingKeys({ hasKeys: false })

      render(<VectorSearchCreateIndexPage />)

      const keyTypeToggle = screen.getByTestId(
        'vector-search--create-index--key-type-toggle',
      )
      expect(keyTypeToggle).toBeInTheDocument()

      fireEvent.click(
        screen.getByTestId('vector-search--create-index--add-field-btn'),
      )
      fireEvent.change(screen.getByTestId('field-type-modal-field-name'), {
        target: { value: 'title' },
      })
      await waitFor(() => {
        expect(screen.getByTestId('field-type-modal-save')).toBeEnabled()
      })
      fireEvent.click(screen.getByTestId('field-type-modal-save'))
      await waitFor(() => {
        expect(
          screen.getByTestId('vector-search--create-index--submit-btn'),
        ).toBeEnabled()
      })

      fireEvent.click(
        screen.getByTestId('vector-search--create-index--key-type-json-btn'),
      )
      fireEvent.click(
        screen.getByTestId('vector-search--create-index--command-view-btn'),
      )

      const commandView = screen.getByTestId(
        'vector-search--create-index--command-view',
      )
      expect(commandView).toHaveTextContent('ON JSON')
    })

    it('should enable the create button once a field is added manually', async () => {
      setupRouterMocks('?mode=existingData')
      mockUseHasExistingKeys({ hasKeys: false })

      render(<VectorSearchCreateIndexPage />)

      fireEvent.click(
        screen.getByTestId('vector-search--create-index--add-field-btn'),
      )

      fireEvent.change(screen.getByTestId('field-type-modal-field-name'), {
        target: { value: 'title' },
      })
      await waitFor(() => {
        expect(screen.getByTestId('field-type-modal-save')).toBeEnabled()
      })
      fireEvent.click(screen.getByTestId('field-type-modal-save'))

      await waitFor(() => {
        expect(
          screen.getByTestId('vector-search--create-index--submit-btn'),
        ).toBeEnabled()
      })
    })
  })
})
