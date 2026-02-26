import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { HeaderTitle } from './HeaderTitle'

const renderComponent = () => render(<HeaderTitle />)

describe('HeaderTitle', () => {
  it('should render the title', () => {
    renderComponent()

    const title = screen.getByTestId('vector-search--list--title')
    expect(title).toBeInTheDocument()
    expect(screen.getByText('Search indexes')).toBeInTheDocument()
  })

  it('should render the info icon', () => {
    renderComponent()

    const infoIcon = screen.getByTestId('vector-search--list--info-icon')
    expect(infoIcon).toBeInTheDocument()
  })

  it('should open the popover when info icon is clicked', () => {
    renderComponent()

    const infoIcon = screen.getByTestId('vector-search--list--info-icon')
    fireEvent.click(infoIcon)

    const popoverText = screen.getByText(/A search index organizes your data/)
    expect(popoverText).toBeInTheDocument()
  })

  it('should render learn more link inside the popover', () => {
    renderComponent()

    const infoIcon = screen.getByTestId('vector-search--list--info-icon')
    fireEvent.click(infoIcon)

    const link = screen.getByTestId('vector-search--list--learn-more-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute(
      'href',
      'https://redis.io/docs/latest/develop/ai/search-and-query/query/vector-search/?utm_source=redisinsight&utm_medium=app&utm_campaign=vector_search',
    )
  })

  it('should close the popover when info icon is clicked again', () => {
    renderComponent()

    const infoIcon = screen.getByTestId('vector-search--list--info-icon')

    fireEvent.click(infoIcon)
    const popoverText = screen.getByText(/A search index organizes your data/)
    expect(popoverText).toBeInTheDocument()

    fireEvent.click(infoIcon)
    const popoverTextAfterClose = screen.queryByText(
      /A search index organizes your data/,
    )
    expect(popoverTextAfterClose).not.toBeInTheDocument()
  })
})
