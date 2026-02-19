import React from 'react'
import { faker } from '@faker-js/faker'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import PersistentErrorContent, { Props } from './PersistentErrorContent'

const mockWriteText = jest.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
})

describe('PersistentErrorContent', () => {
  const defaultProps: Props = {
    text: faker.lorem.sentence(),
    onClose: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<Props>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<PersistentErrorContent {...props} />)
  }

  beforeEach(() => {
    mockWriteText.mockClear()
  })

  it('should render error message', () => {
    renderComponent()
    expect(screen.getByText(defaultProps.text)).toBeInTheDocument()
  })

  it('should render copy button with "Copy" label', () => {
    renderComponent()
    const button = screen.getByTestId('copy-error-message-btn')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Copy')
  })

  it('should copy error message and show "Copied" when clicked', () => {
    renderComponent()
    const button = screen.getByTestId('copy-error-message-btn')
    fireEvent.click(button)
    expect(mockWriteText).toHaveBeenCalledWith(defaultProps.text)
    expect(button).toHaveTextContent('Copied')
  })
})
