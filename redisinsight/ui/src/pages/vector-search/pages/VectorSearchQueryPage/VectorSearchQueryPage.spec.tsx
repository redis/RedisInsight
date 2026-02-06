import React from 'react'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import { VectorSearchQueryPage } from './VectorSearchQueryPage'

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({
      instanceId: 'test-instance-id',
      indexName: 'test-index',
    }),
  }
})

describe('VectorSearchQueryPage', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render query page', () => {
    const { container } = render(<VectorSearchQueryPage />)

    expect(container).toBeTruthy()

    const page = screen.getByTestId('vector-search-query-page')
    expect(page).toBeInTheDocument()
  })
})
