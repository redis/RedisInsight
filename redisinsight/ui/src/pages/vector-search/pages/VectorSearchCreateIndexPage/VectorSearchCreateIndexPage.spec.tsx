import React from 'react'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import { VectorSearchCreateIndexPage } from './VectorSearchCreateIndexPage'

describe('VectorSearchCreateIndexPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render create index page', () => {
    const { container } = render(<VectorSearchCreateIndexPage />)

    expect(container).toBeTruthy()

    const page = screen.getByTestId('vector-search-create-index-page')
    expect(page).toBeInTheDocument()
  })
})
