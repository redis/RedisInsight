import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { faker } from '@faker-js/faker'

import { PageHeader } from './PageHeader'
import { PageHeaderProps } from './PageHeader.types'

describe('PageHeader', () => {
  const defaultProps: PageHeaderProps = {
    indexName: faker.string.alpha(10),
    indexOptions: [
      { value: 'index-1', label: 'index-1' },
      { value: 'index-2', label: 'index-2' },
    ],
    onIndexChange: jest.fn(),
    onToggleIndexPanel: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<PageHeaderProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<PageHeader {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render header with breadcrumb and view index button', () => {
    renderComponent()

    const breadcrumb = screen.getByTestId('breadcrumb-search-indexes')
    const viewIndexBtn = screen.getByTestId('view-index-btn')

    expect(breadcrumb).toBeInTheDocument()
    expect(viewIndexBtn).toBeInTheDocument()
  })
})
