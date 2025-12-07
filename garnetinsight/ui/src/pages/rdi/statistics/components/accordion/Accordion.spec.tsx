import React from 'react'

import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import Accordion from './Accordion'

const mockedProps = {
  id: 'accordion',
  title: 'Accordion Title',
  children: <div>Accordion Content</div>,
  onRefresh: jest.fn(),
  onRefreshClicked: jest.fn(),
}

describe('Accordion', () => {
  it('renders the title and children', () => {
    render(<Accordion {...mockedProps} />)

    expect(screen.getByText('Accordion Title')).toBeInTheDocument()
    expect(screen.getByText('Accordion Content')).toBeInTheDocument()
  })

  it('calls the onRefresh callback when the refresh button is clicked', () => {
    render(<Accordion {...mockedProps} />)

    fireEvent.click(screen.getByTestId('accordion-refresh-btn'))

    expect(mockedProps.onRefresh).toHaveBeenCalled()
  })

  it('calls the onRefreshClicked callback when the refresh button is clicked', () => {
    render(<Accordion {...mockedProps} />)

    fireEvent.click(screen.getByTestId('accordion-refresh-btn'))

    expect(mockedProps.onRefreshClicked).toHaveBeenCalled()
  })

  it('does not render the auto refresh button when hideAutoRefresh prop is true', () => {
    render(<Accordion {...mockedProps} hideAutoRefresh />)

    expect(screen.queryByTestId('accordion-refresh-btn')).toBeNull()
  })
})
