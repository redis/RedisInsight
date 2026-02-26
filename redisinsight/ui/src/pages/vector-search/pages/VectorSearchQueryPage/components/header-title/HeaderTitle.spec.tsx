import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { faker } from '@faker-js/faker'

import { HeaderTitle, HeaderTitleProps } from './HeaderTitle'

describe('HeaderTitle', () => {
  const defaultProps: HeaderTitleProps = {
    indexName: faker.string.alpha(10),
    indexOptions: [
      { value: 'index-1', label: 'index-1' },
      { value: 'index-2', label: 'index-2' },
    ],
    onIndexChange: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<HeaderTitleProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<HeaderTitle {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render breadcrumb with labels and index select', () => {
    renderComponent()

    const breadcrumb = screen.getByTestId('breadcrumb-search-indexes')
    const link = screen.getByTestId('breadcrumb-search-indexes-link')
    const searchLabel = screen.getByText('Search indexes')
    const queryLabel = screen.getByText('Query index:')
    const trigger = screen.getByTestId('index-select-trigger')

    expect(breadcrumb).toBeInTheDocument()
    expect(link).toBeInTheDocument()
    expect(searchLabel).toBeInTheDocument()
    expect(queryLabel).toBeInTheDocument()
    expect(trigger).toBeInTheDocument()
  })
})
