import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { ApiEndpoints, MOCK_TUTORIALS_ITEMS } from 'uiSrc/constants'
import {
  defaultValue,
  EnablementAreaProvider,
} from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { EnablementAreaComponent } from 'uiSrc/slices/interfaces'

import Pagination from './Pagination'

const paginationItems =
  MOCK_TUTORIALS_ITEMS[0]?.children
    ?.map((item, index) => ({ ...item, _key: `${index}` }))
    ?.filter((item) => item.type === EnablementAreaComponent.InternalLink) || []

describe('Pagination', () => {
  it('should render', () => {
    const component = render(
      <Pagination
        sourcePath={ApiEndpoints.GUIDES_PATH}
        items={paginationItems}
      />,
    )
    const { queryByTestId } = component

    expect(component).toBeTruthy()
    expect(
      queryByTestId('enablement-area__prev-page-btn'),
    ).not.toBeInTheDocument()
    expect(queryByTestId('enablement-area__next-page-btn')).toBeInTheDocument()
  })
  it('should correctly open menu', () => {
    const { queryByTestId } = render(
      <Pagination
        sourcePath={ApiEndpoints.GUIDES_PATH}
        items={paginationItems}
        activePageKey="0"
      />,
    )
    fireEvent.click(
      screen.getByTestId('enablement-area__toggle-pagination-menu-btn'),
    )
    const menu = queryByTestId('enablement-area__pagination-menu')

    expect(menu).toBeInTheDocument()
    expect(menu?.querySelectorAll('[data-testid^="menu-item"]').length).toEqual(
      paginationItems.length,
    )
    // Verify the first menu item (which corresponds to activePageKey="0") has correct content
    expect(screen.getByTestId('menu-item-0')).toHaveTextContent(
      paginationItems[0].label,
    )
  })
  it('should correctly open next page', () => {
    const openPage = jest.fn()
    const pageIndex = 0

    render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <Pagination
          sourcePath={ApiEndpoints.GUIDES_PATH}
          items={paginationItems}
          activePageKey="0"
        />
      </EnablementAreaProvider>,
    )
    fireEvent.click(screen.getByTestId('enablement-area__next-page-btn'))

    expect(openPage).toHaveBeenCalledWith({
      path:
        ApiEndpoints.GUIDES_PATH + paginationItems[pageIndex + 1]?.args?.path,
      manifestPath: expect.any(String),
    })
  })
  it('should correctly open previous page', () => {
    const openPage = jest.fn()
    const pageIndex = 1

    render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <Pagination
          sourcePath={ApiEndpoints.GUIDES_PATH}
          items={paginationItems}
          activePageKey="1"
        />
      </EnablementAreaProvider>,
    )
    fireEvent.click(screen.getByTestId('enablement-area__prev-page-btn'))

    expect(openPage).toHaveBeenCalledWith({
      path:
        ApiEndpoints.GUIDES_PATH + paginationItems[pageIndex - 1]?.args?.path,
      manifestPath: expect.any(String),
    })
  })
  it('should correctly open by using pagination menu', async () => {
    const openPage = jest.fn()
    const ACTIVE_PAGE_KEY = '0'
    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <Pagination
          sourcePath={ApiEndpoints.GUIDES_PATH}
          items={paginationItems}
          activePageKey={ACTIVE_PAGE_KEY}
        />
      </EnablementAreaProvider>,
    )

    const toggleMenuBtnId = 'enablement-area__toggle-pagination-menu-btn'
    for (let i = 0; i < paginationItems.length; i++) {
      const pageItem = paginationItems[i]

      if (pageItem._key !== ACTIVE_PAGE_KEY) {
        // Reopen the menu each time
        fireEvent.click(screen.getByTestId(toggleMenuBtnId))

        const menu = queryByTestId('enablement-area__pagination-menu')
        expect(menu).not.toBeNull()

        const menuItem = menu?.querySelector(
          `[data-testid="menu-item-${pageItem._key}"]`,
        )
        expect(menuItem).not.toBeNull()

        fireEvent.click(menuItem as Element)
      }
    }

    expect(openPage).toHaveBeenCalledTimes(paginationItems.length - 1) // -1 because active item should not be clickable
    expect(openPage).toHaveBeenLastCalledWith({
      path:
        ApiEndpoints.GUIDES_PATH +
        paginationItems[paginationItems.length - 1]?.args?.path,
      manifestPath: expect.any(String),
    })
  })
})
