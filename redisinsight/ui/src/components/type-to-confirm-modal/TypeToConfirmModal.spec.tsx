import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import TypeToConfirmModal, { Props } from './TypeToConfirmModal'

const mockProps: Props = {
  confirmationText: 'prod-cache-eu-west-1',
  actionDescription: 'This will run FLUSHDB against prod-cache-eu-west-1.',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
}

jest.mock('uiSrc/components/base/display', () => {
  const actual = jest.requireActual('uiSrc/components/base/display')

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      Content: {
        ...actual.Modal.Content,
        Header: {
          ...actual.Modal.Content.Header,
          Title: jest.fn().mockReturnValue(null),
        },
      },
    },
  }
})

const typeInConfirmInput = (value: string) => {
  fireEvent.change(screen.getByTestId('type-to-confirm-modal-input'), {
    target: { value },
  })
}

describe('TypeToConfirmModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<TypeToConfirmModal {...mockProps} />)).toBeTruthy()
  })

  it('should render the action description', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    expect(
      screen.getByTestId('type-to-confirm-modal-description'),
    ).toHaveTextContent('This will run FLUSHDB against prod-cache-eu-west-1.')
  })

  it('should accept a ReactNode as actionDescription', () => {
    render(
      <TypeToConfirmModal
        {...mockProps}
        actionDescription={<span data-testid="custom-desc">custom desc</span>}
      />,
    )

    expect(screen.getByTestId('custom-desc')).toBeInTheDocument()
  })

  it('confirm button should be disabled by default', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()
  })

  it('confirm button should be disabled when typed value does not match confirmationText', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    typeInConfirmInput('not-the-name')

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()
  })

  it('confirm button should be enabled when typed value exactly matches confirmationText', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    typeInConfirmInput('prod-cache-eu-west-1')

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).not.toBeDisabled()
  })

  it('match should be case-sensitive', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    typeInConfirmInput('PROD-CACHE-EU-WEST-1')

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()
  })

  it('should not fire onConfirm when typed value does not match', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    typeInConfirmInput('mismatch')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(mockProps.onConfirm).not.toHaveBeenCalled()
  })

  it('should fire onConfirm when typed value matches and confirm is clicked', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    typeInConfirmInput('prod-cache-eu-west-1')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should fire onCancel when cancel button is clicked', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    fireEvent.click(screen.getByTestId('type-to-confirm-modal-cancel-btn'))

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('cancel button should be the default-focused action', () => {
    render(<TypeToConfirmModal {...mockProps} />)

    expect(screen.getByTestId('type-to-confirm-modal-cancel-btn')).toHaveFocus()
  })

  it('should render custom button labels when provided', () => {
    render(
      <TypeToConfirmModal
        {...mockProps}
        confirmButtonText="Run FLUSHDB"
        cancelButtonText="Back"
      />,
    )

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toHaveTextContent('Run FLUSHDB')
    expect(
      screen.getByTestId('type-to-confirm-modal-cancel-btn'),
    ).toHaveTextContent('Back')
  })
})
