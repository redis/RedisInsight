import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { render, screen, cleanup, mockedStore } from 'uiSrc/utils/test-utils'
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
})
