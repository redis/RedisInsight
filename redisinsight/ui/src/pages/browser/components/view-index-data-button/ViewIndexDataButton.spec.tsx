import React from 'react'
import reactRouterDom from 'react-router-dom'
import { faker } from '@faker-js/faker'
import {
  cleanup,
  render,
  screen,
  fireEvent,
  userEvent,
} from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import { IndexSummary } from 'uiSrc/slices/interfaces/redisearch'

import { ViewIndexDataButton } from './ViewIndexDataButton'
import { ViewIndexDataButtonProps } from './ViewIndexDataButton.types'

const mockPush = jest.fn()
const mockInstanceId = faker.string.uuid()

const buildIndex = (overrides?: Partial<IndexSummary>): IndexSummary => ({
  name: faker.string.alpha(10),
  prefixes: [faker.string.alpha(5)],
  keyType: 'HASH',
  ...overrides,
})

const defaultProps: ViewIndexDataButtonProps = {
  indexes: [],
  instanceId: mockInstanceId,
}

const renderComponent = (propsOverride?: Partial<ViewIndexDataButtonProps>) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(<ViewIndexDataButton {...props} />)
}

describe('ViewIndexDataButton', () => {
  beforeEach(() => {
    cleanup()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('0 indexes (placeholder)', () => {
    it('should render disabled placeholder button', () => {
      renderComponent({ indexes: [] })

      const btn = screen.getByTestId('view-index-data-btn-placeholder')
      expect(btn).toBeInTheDocument()
      expect(btn).toBeDisabled()
      expect(btn).toHaveTextContent('View index')
    })

    it('should not navigate when placeholder is clicked', () => {
      renderComponent({ indexes: [] })

      fireEvent.click(screen.getByTestId('view-index-data-btn-placeholder'))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('1 index (direct button)', () => {
    it('should render a single text button with "View index" label', () => {
      const index = buildIndex({ name: 'movies_index' })
      renderComponent({ indexes: [index] })

      const btn = screen.getByTestId('view-index-data-btn')
      expect(btn).toBeInTheDocument()
      expect(btn).toHaveTextContent('View index')
      expect(btn).not.toBeDisabled()
    })

    it('should navigate to the index query page on click', async () => {
      const index = buildIndex({ name: 'movies_index' })
      renderComponent({ indexes: [index] })

      await userEvent.click(screen.getByTestId('view-index-data-btn'))

      expect(mockPush).toHaveBeenCalledWith(
        Pages.vectorSearchQuery(
          mockInstanceId,
          encodeURIComponent('movies_index'),
        ),
      )
    })

    it('should call onNavigate callback instead of history.push when provided', async () => {
      const index = buildIndex({ name: 'movies_index' })
      const onNavigate = jest.fn()
      renderComponent({ indexes: [index], onNavigate })

      await userEvent.click(screen.getByTestId('view-index-data-btn'))

      expect(onNavigate).toHaveBeenCalledWith('movies_index')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('2+ indexes (dropdown menu)', () => {
    const indexes = [
      buildIndex({ name: 'products_index' }),
      buildIndex({ name: 'users_index' }),
      buildIndex({ name: 'id_index' }),
    ]

    it('should render menu trigger with "View index" label and count badge', () => {
      renderComponent({ indexes })

      const trigger = screen.getByTestId('view-index-data-menu-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('View index')

      const badge = screen.getByTestId('view-index-data-count-badge')
      expect(badge).toHaveTextContent('3')
    })

    it('should show menu items when trigger is clicked', async () => {
      renderComponent({ indexes })

      await userEvent.click(screen.getByTestId('view-index-data-menu-trigger'))

      for (const index of indexes) {
        expect(
          screen.getByTestId(`view-index-data-item-${index.name}`),
        ).toBeInTheDocument()
      }
    })

    it('should navigate to the correct index when a menu item is clicked', async () => {
      renderComponent({ indexes })

      await userEvent.click(screen.getByTestId('view-index-data-menu-trigger'))
      await userEvent.click(
        screen.getByTestId('view-index-data-item-users_index'),
      )

      expect(mockPush).toHaveBeenCalledWith(
        Pages.vectorSearchQuery(
          mockInstanceId,
          encodeURIComponent('users_index'),
        ),
      )
    })

    it('should call onNavigate callback for menu items when provided', async () => {
      const onNavigate = jest.fn()
      renderComponent({ indexes, onNavigate })

      await userEvent.click(screen.getByTestId('view-index-data-menu-trigger'))
      await userEvent.click(
        screen.getByTestId('view-index-data-item-products_index'),
      )

      expect(onNavigate).toHaveBeenCalledWith('products_index')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
