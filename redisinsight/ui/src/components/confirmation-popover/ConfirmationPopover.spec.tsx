import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import ConfirmationPopover, { ConfirmationPopoverProps } from './ConfirmationPopover'

const mockClosePopover = jest.fn()
const mockButtonClick = jest.fn()

const defaultProps: ConfirmationPopoverProps = {
  isOpen: true,
  closePopover: mockClosePopover,
  button: <button data-testid="trigger-button">Trigger</button>,
  confirmButton: (
    <button data-testid="confirm-button" onClick={mockButtonClick}>
      Confirm
    </button>
  ),
}

const renderConfirmationPopover = (props: Partial<ConfirmationPopoverProps> = {}) => {
  return render(<ConfirmationPopover {...defaultProps} {...props} />)
}

describe('ConfirmationPopover', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with required props only', () => {
      renderConfirmationPopover()
      
      expect(screen.getByTestId('trigger-button')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
    })

    it('should render the confirm button', () => {
      renderConfirmationPopover()
      
      const confirmButton = screen.getByTestId('confirm-button')
      expect(confirmButton).toBeInTheDocument()
      expect(confirmButton).toHaveTextContent('Confirm')
    })

    it('should not render title when not provided', () => {
      renderConfirmationPopover()
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('should not render message when not provided', () => {
      renderConfirmationPopover()
      
      expect(screen.queryByText(/message/i)).not.toBeInTheDocument()
    })
  })

  describe('Optional Props', () => {
    it('should render title when provided', () => {
      const title = 'Confirmation Required'
      renderConfirmationPopover({ title })

      expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('should render message when provided', () => {
      const message = 'Are you sure you want to proceed?'
      renderConfirmationPopover({ message })

      expect(screen.getByText(message)).toBeInTheDocument()
    })

    it('should render both title and message when provided', () => {
      const title = 'Delete Item'
      const message = 'This action cannot be undone.'
      renderConfirmationPopover({ title, message })

      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByText(message)).toBeInTheDocument()
    })

    it('should render with custom confirm button', () => {
      const customConfirmButton = (
        <button data-testid="custom-confirm" className="custom-class">
          Delete Forever
        </button>
      )
      renderConfirmationPopover({ confirmButton: customConfirmButton })

      const customButton = screen.getByTestId('custom-confirm')
      expect(customButton).toBeInTheDocument()
      expect(customButton).toHaveTextContent('Delete Forever')
      expect(customButton).toHaveClass('custom-class')
    })
  })

  describe('RiPopover Integration', () => {
    it('should pass through isOpen prop to RiPopover', () => {
      const { rerender } = renderConfirmationPopover({ isOpen: false })

      expect(screen.queryByTestId('confirm-button')).not.toBeInTheDocument()
      rerender(<ConfirmationPopover {...defaultProps} isOpen={true} />)
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
    })

    it('should pass through closePopover prop to RiPopover', () => {
      renderConfirmationPopover()
      
      fireEvent.click(document.body)
    })

    it('should pass through button prop to RiPopover', () => {
      const customButton = <button data-testid="custom-trigger">Custom Trigger</button>
      renderConfirmationPopover({ button: customButton })

      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('custom-trigger')).toHaveTextContent('Custom Trigger')
    })

    it('should pass through additional RiPopover props', () => {
      const additionalProps = {
        anchorPosition: 'rightCenter' as const,
        panelPaddingSize: 'l' as const,
        'data-testid': 'custom-popover',
      }

      renderConfirmationPopover(additionalProps)

      expect(screen.getByTestId('custom-popover')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should handle confirm button click', () => {
      renderConfirmationPopover()

      const confirmButton = screen.getByTestId('confirm-button')
      fireEvent.click(confirmButton)

      expect(mockButtonClick).toHaveBeenCalledTimes(1)
    })

    it('should handle trigger button interaction', () => {
      const triggerClickMock = jest.fn()
      const customTrigger = (
        <button data-testid="trigger-button" onClick={triggerClickMock}>
          Trigger
        </button>
      )

      renderConfirmationPopover({ button: customTrigger })

      const triggerButton = screen.getByTestId('trigger-button')
      fireEvent.click(triggerButton)

      expect(triggerClickMock).toHaveBeenCalledTimes(1)
    })

    it('should not interfere with confirm button when disabled', () => {
      const disabledConfirmButton = (
        <button data-testid="confirm-button" disabled onClick={mockButtonClick}>
          Confirm
        </button>
      )

      renderConfirmationPopover({ confirmButton: disabledConfirmButton })

      const confirmButton = screen.getByTestId('confirm-button')
      expect(confirmButton).toBeDisabled()

      fireEvent.click(confirmButton)
      expect(mockButtonClick).not.toHaveBeenCalled()
    })
  })

  describe('Layout and Structure', () => {
    it('should have correct structure with title and message', () => {
      const title = 'Confirm Action'
      const message = 'This is a test message'
      renderConfirmationPopover({ title, message })

      const titleElement = screen.getByText(title)
      const messageElement = screen.getByText(message)
      const confirmButton = screen.getByTestId('confirm-button')

      expect(titleElement).toBeInTheDocument()
      expect(messageElement).toBeInTheDocument()
      expect(confirmButton).toBeInTheDocument()
      
      const allElements = screen.getAllByText(/Confirm Action|This is a test message|Confirm/)
      expect(allElements[0]).toBe(titleElement)
      expect(allElements[1]).toBe(messageElement)
    })

    it('should maintain proper spacing between elements', () => {
      const title = 'Test Title'
      const message = 'Test Message'
      renderConfirmationPopover({ title, message })

      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByText(message)).toBeInTheDocument()
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
    })

    it('should handle long text content gracefully', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines'
      const longMessage = 'This is a very long message that should break properly with word-break styling'

      renderConfirmationPopover({
        title: longTitle,
        message: longMessage
      })

      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })
  })
})
