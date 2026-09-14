import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { render, screen, cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import { PageNames } from 'uiSrc/constants'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import PipelineManagementV2Page from './PipelineManagementV2Page'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = mockedStore
})

const renderPage = () =>
  render(
    <BrowserRouter>
      <PipelineManagementV2Page />
    </BrowserRouter>,
    { store },
  )

describe('PipelineManagementV2Page', () => {
  it('should render the placeholder', () => {
    renderPage()

    expect(
      screen.getByTestId('pipeline-management-v2-page'),
    ).toBeInTheDocument()
  })

  it('should render the instance breadcrumb, but not the v1 shell (tabs/status bar)', () => {
    renderPage()

    // Kept for navigation consistency with the rest of RedisInsight.
    expect(screen.getByTestId('breadcrumbs-container')).toBeInTheDocument()
    // The v1-only chrome (AppNavigation's Pipeline/Analytics tabs and
    // RdiPipelineHeader's status bar) must not be pulled in - this page is a
    // standalone route, not nested inside RdiInstancePage.
    expect(screen.queryByTestId('pipeline-management-page-btn')).toBeNull()
    expect(screen.queryByTestId('pipeline-status-page-btn')).toBeNull()
  })

  it('should record itself as the last visited rdi section on unmount', () => {
    const { unmount } = renderPage()

    unmount()

    expect(store.getActions()).toContainEqual(
      setLastPageContext(PageNames.rdiPipelineManagement),
    )
  })
})
