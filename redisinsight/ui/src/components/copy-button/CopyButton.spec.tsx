import React from 'react'
import { faker } from '@faker-js/faker'

import { render, fireEvent, screen, waitFor, act } from 'uiSrc/utils/test-utils'

import { CopyButton } from './CopyButton'
import { CopyButtonProps } from './CopyButton.types'

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  handleCopy: jest.fn(),
}))

import { handleCopy } from 'uiSrc/utils'

const mockedHandleCopy = jest.mocked(handleCopy)

describe('CopyButton', () => {
  const defaultProps: CopyButtonProps = {
    copy: faker.lorem.sentence(),
  }

  const renderComponent = (propsOverride?: Partial<CopyButtonProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<CopyButton {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render copy button with default test id', () => {
    renderComponent()

    expect(screen.getByTestId('copy-button-btn')).toBeInTheDocument()
  })

  it('should render copy button with custom test id', () => {
    const customTestId = faker.string.alphanumeric(10)
    renderComponent({ 'data-testid': customTestId })

    expect(screen.getByTestId(`${customTestId}-btn`)).toBeInTheDocument()
  })

  it('should copy text to clipboard when clicked', () => {
    const textToCopy = faker.lorem.sentence()
    renderComponent({ copy: textToCopy })

    fireEvent.click(screen.getByTestId('copy-button-btn'))

    expect(mockedHandleCopy).toHaveBeenCalledWith(textToCopy)
  })

  it('should call onCopy callback when clicked', async () => {
    const onCopyMock = jest.fn()
    renderComponent({ onCopy: onCopyMock })

    fireEvent.click(screen.getByTestId('copy-button-btn'))

    await waitFor(() => {
      expect(onCopyMock).toHaveBeenCalledTimes(1)
    })
  })

  it('should show success badge after copying', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('copy-button-btn'))

    expect(screen.getByTestId('copy-button-badge')).toBeInTheDocument()
    expect(screen.getByText('Copied')).toBeInTheDocument()
  })

  it('should show custom success label after copying', () => {
    const customLabel = faker.lorem.word()
    renderComponent({ successLabel: customLabel })

    fireEvent.click(screen.getByTestId('copy-button-btn'))

    expect(screen.getByText(customLabel)).toBeInTheDocument()
  })

  it('should hide button when showing success badge', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('copy-button-btn'))

    expect(screen.queryByTestId('copy-button-btn')).not.toBeInTheDocument()
    expect(screen.getByTestId('copy-button-badge')).toBeInTheDocument()
  })

  it('should reset to button state after resetDuration', async () => {
    const resetDuration = 1000
    renderComponent({ resetDuration })

    fireEvent.click(screen.getByTestId('copy-button-btn'))

    expect(screen.getByTestId('copy-button-badge')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(resetDuration)
    })

    await waitFor(() => {
      expect(screen.getByTestId('copy-button-btn')).toBeInTheDocument()
      expect(screen.queryByTestId('copy-button-badge')).not.toBeInTheDocument()
    })
  })

  it('should not copy when button is disabled', () => {
    renderComponent({ disabled: true })

    const button = screen.getByTestId('copy-button-btn')
    expect(button).toBeDisabled()
  })

  it('should stop event propagation when clicked', () => {
    const parentClickHandler = jest.fn()
    render(
      <div onClick={parentClickHandler}>
        <CopyButton {...defaultProps} />
      </div>,
    )

    fireEvent.click(screen.getByTestId('copy-button-btn'))

    expect(parentClickHandler).not.toHaveBeenCalled()
  })

  it('should use custom aria-label when provided', () => {
    const customAriaLabel = faker.lorem.words(2)
    renderComponent({ 'aria-label': customAriaLabel })

    const button = screen.getByTestId('copy-button-btn')
    expect(button).toHaveAttribute('aria-label', customAriaLabel)
  })

  it('should use default aria-label when not provided', () => {
    renderComponent()

    const button = screen.getByTestId('copy-button-btn')
    expect(button).toHaveAttribute('aria-label', 'Copy')
  })
})
