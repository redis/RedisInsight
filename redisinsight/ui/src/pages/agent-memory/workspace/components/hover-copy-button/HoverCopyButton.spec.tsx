import React from 'react'
import { faker } from '@faker-js/faker'

import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'

import HoverCopyButton, { HoverCopyButtonProps } from './HoverCopyButton'

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  handleCopy: jest.fn(),
}))

import { handleCopy } from 'uiSrc/utils'

const mockedHandleCopy = jest.mocked(handleCopy)

describe('HoverCopyButton', () => {
  const defaultProps: HoverCopyButtonProps = {
    copy: faker.lorem.sentence(),
    label: 'Copy session id',
    testId: 'hover-copy',
  }

  const renderComponent = (propsOverride?: Partial<HoverCopyButtonProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<HoverCopyButton {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render the shared CopyButton with the given testId and label', () => {
    renderComponent()

    const button = screen.getByTestId('hover-copy-btn')

    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', defaultProps.label)
  })

  it('should copy the given text and keep the Copied badge rendered on click', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('hover-copy-btn'))

    expect(mockedHandleCopy).toHaveBeenCalledWith(defaultProps.copy)
    expect(screen.getByTestId('hover-copy-badge')).toBeInTheDocument()
  })

  it('should revert to the copy button after the badge lifetime', async () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('hover-copy-btn'))

    expect(screen.getByTestId('hover-copy-badge')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(3_000)
    })

    await waitFor(() => {
      expect(screen.getByTestId('hover-copy-btn')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('hover-copy-badge')).not.toBeInTheDocument()
  })
})
