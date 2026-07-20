import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { AzureSignInDialog } from './AzureSignInDialog'
import { AzureSignInDialogProps } from './AzureSignInDialog.types'

const TEST_ID = 'azure-sign-in-dialog'

describe('AzureSignInDialog', () => {
  const defaultProps: AzureSignInDialogProps = {
    isOpen: true,
    loading: false,
    onClose: jest.fn(),
    onSignIn: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<AzureSignInDialogProps>) =>
    render(<AzureSignInDialog {...defaultProps} {...propsOverride} />)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    renderComponent({ isOpen: false })

    expect(screen.queryByTestId(`${TEST_ID}-body`)).not.toBeInTheDocument()
  })

  it('should render sign-in and cancel buttons by default', () => {
    renderComponent()

    expect(screen.getByTestId(`${TEST_ID}-sign-in`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-cancel`)).toBeInTheDocument()
  })

  it('should show the tenant field by default', () => {
    renderComponent()

    expect(screen.getByTestId(`${TEST_ID}-tenant-input`)).toBeInTheDocument()
  })

  it('should sign in with no tenant when the field is left empty', () => {
    const onSignIn = jest.fn()
    renderComponent({ onSignIn })

    fireEvent.click(screen.getByTestId(`${TEST_ID}-sign-in`))

    expect(onSignIn).toHaveBeenCalledWith(undefined)
  })

  it('should sign in with the entered tenant', () => {
    const onSignIn = jest.fn()
    renderComponent({ onSignIn })

    fireEvent.change(screen.getByTestId(`${TEST_ID}-tenant-input`), {
      target: { value: 'your-tenant.onmicrosoft.com' },
    })
    fireEvent.click(screen.getByTestId(`${TEST_ID}-sign-in`))

    expect(onSignIn).toHaveBeenCalledWith('your-tenant.onmicrosoft.com')
  })

  it('should disable sign-in and not submit an invalid tenant', () => {
    const onSignIn = jest.fn()
    renderComponent({ onSignIn })

    fireEvent.change(screen.getByTestId(`${TEST_ID}-tenant-input`), {
      target: { value: 'not a tenant' },
    })

    expect(screen.getByTestId(`${TEST_ID}-sign-in`)).toBeDisabled()

    fireEvent.click(screen.getByTestId(`${TEST_ID}-sign-in`))
    expect(onSignIn).not.toHaveBeenCalled()
  })

  it('should call onClose when cancel is clicked', () => {
    const onClose = jest.fn()
    renderComponent({ onClose })

    fireEvent.click(screen.getByTestId(`${TEST_ID}-cancel`))

    expect(onClose).toHaveBeenCalled()
  })
})
