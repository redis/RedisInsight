import React from 'react'
import { faker } from '@faker-js/faker'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import TypeToConfirmModal, { Props } from './TypeToConfirmModal'

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

const confirmationText = faker.lorem.slug()

const defaultProps: Props = {
  confirmationText,
  actionDescription: faker.lorem.sentence(),
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<Props>) =>
  render(<TypeToConfirmModal {...defaultProps} {...propsOverride} />)

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
    expect(renderComponent()).toBeTruthy()
  })

  it('should render the action description', () => {
    const actionDescription = faker.lorem.sentence()
    renderComponent({ actionDescription })

    expect(
      screen.getByTestId('type-to-confirm-modal-description'),
    ).toHaveTextContent(actionDescription)
  })

  it('should accept a ReactNode as actionDescription', () => {
    renderComponent({
      actionDescription: <span data-testid="custom-desc">custom desc</span>,
    })

    expect(screen.getByTestId('custom-desc')).toBeInTheDocument()
  })

  it('should render the confirmation input by default', () => {
    renderComponent()

    expect(
      screen.getByTestId('type-to-confirm-modal-input'),
    ).toBeInTheDocument()
  })

  it('confirm button should be disabled by default', () => {
    renderComponent()

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()
  })

  it('confirm button should be disabled when typed value does not match confirmationText', () => {
    renderComponent()

    typeInConfirmInput('not-the-name')

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()
  })

  it('confirm button should be enabled when typed value exactly matches confirmationText', () => {
    renderComponent()

    typeInConfirmInput(confirmationText)

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).not.toBeDisabled()
  })

  it('match should be case-sensitive', () => {
    renderComponent()

    typeInConfirmInput(confirmationText.toUpperCase())

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()
  })

  it('should not fire onConfirm when typed value does not match', () => {
    const onConfirm = jest.fn()
    renderComponent({ onConfirm })

    typeInConfirmInput('mismatch')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('should fire onConfirm when typed value matches and confirm is clicked', () => {
    const onConfirm = jest.fn()
    renderComponent({ onConfirm })

    typeInConfirmInput(confirmationText)
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should fire onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn()
    renderComponent({ onCancel })

    fireEvent.click(screen.getByTestId('type-to-confirm-modal-cancel-btn'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('cancel button should be the default-focused action', () => {
    renderComponent()

    expect(screen.getByTestId('type-to-confirm-modal-cancel-btn')).toHaveFocus()
  })

  it('should render custom button labels when provided', () => {
    const confirmButtonText = faker.lorem.words(2)
    const cancelButtonText = faker.lorem.words(2)
    renderComponent({ confirmButtonText, cancelButtonText })

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toHaveTextContent(confirmButtonText)
    expect(
      screen.getByTestId('type-to-confirm-modal-cancel-btn'),
    ).toHaveTextContent(cancelButtonText)
  })

  describe('with disableConfirmationInput', () => {
    it('should not render the confirmation input', () => {
      renderComponent({ disableConfirmationInput: true })

      expect(
        screen.queryByTestId('type-to-confirm-modal-input'),
      ).not.toBeInTheDocument()
    })

    it('confirm button should be enabled immediately', () => {
      renderComponent({ disableConfirmationInput: true })

      expect(
        screen.getByTestId('type-to-confirm-modal-confirm-btn'),
      ).not.toBeDisabled()
    })

    it('should fire onConfirm when confirm is clicked', () => {
      const onConfirm = jest.fn()
      renderComponent({ disableConfirmationInput: true, onConfirm })

      fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  it('should not render the skip-for-session checkbox by default', () => {
    renderComponent()

    expect(
      screen.queryByTestId('type-to-confirm-modal-skip-checkbox'),
    ).not.toBeInTheDocument()
  })

  it('should render the skip-for-session checkbox when showSkipForSession is true', () => {
    renderComponent({ showSkipForSession: true })

    expect(
      screen.getByTestId('type-to-confirm-modal-skip-checkbox'),
    ).toBeInTheDocument()
  })

  it('should render the default skip-for-session label', () => {
    renderComponent({ showSkipForSession: true })

    expect(
      screen.getByText("Don't ask again for this command during this session"),
    ).toBeInTheDocument()
  })

  it('should pass skipForSession=false to onConfirm when checkbox is not checked', () => {
    const onConfirm = jest.fn()
    renderComponent({ onConfirm, showSkipForSession: true })

    typeInConfirmInput(confirmationText)
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(onConfirm).toHaveBeenCalledWith(false)
  })

  it('should pass skipForSession=true to onConfirm when checkbox is checked', () => {
    const onConfirm = jest.fn()
    renderComponent({ onConfirm, showSkipForSession: true })

    typeInConfirmInput(confirmationText)
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-skip-checkbox'))
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(onConfirm).toHaveBeenCalledWith(true)
  })

  it('should not render the tip section by default', () => {
    renderComponent()

    expect(
      screen.queryByTestId('type-to-confirm-modal-tip'),
    ).not.toBeInTheDocument()
  })

  it('should render the tip when provided', () => {
    renderComponent({
      tip: <span data-testid="tip-content">helpful tip</span>,
    })

    expect(screen.getByTestId('type-to-confirm-modal-tip')).toBeInTheDocument()
    expect(screen.getByTestId('tip-content')).toBeInTheDocument()
  })
})
