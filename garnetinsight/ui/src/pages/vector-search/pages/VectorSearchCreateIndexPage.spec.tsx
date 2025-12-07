import React from 'react'

import { cleanup, render } from 'uiSrc/utils/test-utils'
import VectorSearchCreateIndexPage from './VectorSearchCreateIndexPage'

const renderVectorSearchCreateIndexPageComponent = () =>
  render(<VectorSearchCreateIndexPage />)

describe('VectorSearchCreateIndexPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render ', () => {
    const { container } = renderVectorSearchCreateIndexPageComponent()

    expect(container).toBeTruthy()
  })
})
