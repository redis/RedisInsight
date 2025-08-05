import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import TextDetailsWrapper from './TextDetailsWrapper'

describe('TextDetailsWrapper', () => {
  it('should render children correctly', () => {
    const { queryByTestId } = render(
      <TextDetailsWrapper onClose={jest.fn()}>
        <div data-testid="children-wrapper">Children</div>
      </TextDetailsWrapper>,
    )

    expect(queryByTestId('children-wrapper')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn()

    render(
      <TextDetailsWrapper onClose={mockOnClose}>
        <div data-testid="children-wrapper">Children</div>
      </TextDetailsWrapper>,
    )

    fireEvent.click(screen.getByTestId('close-key-btn'))

    expect(mockOnClose).toBeCalledTimes(1)
  })
})
