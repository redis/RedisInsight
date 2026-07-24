import React from 'react'
import {
  act,
  cleanup,
  createMockedStore,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  oauthCloudMfaSelector,
  resetMfaError,
  setMfaDialogState,
  setOAuthCloudSource,
  submitMfaCode,
  submitMfaCodeSuccess,
} from 'uiSrc/slices/oauth/cloud'
import { apiService } from 'uiSrc/services'
import OAuthMfaDialog from './OAuthMfaDialog'
import { OAuthMfaDialogProps } from './OAuthMfaDialog.types'

const mockMfaOpenState = {
  isOpenDialog: true,
  loading: false,
  error: '',
}

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudMfaSelector: jest.fn().mockReturnValue({
    isOpenDialog: true,
    loading: false,
    error: '',
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  jest.clearAllMocks()
  store = createMockedStore()
  store.clearActions()
})

const renderComponent = (propsOverride?: Partial<OAuthMfaDialogProps>) =>
  render(<OAuthMfaDialog {...propsOverride} />, { store })

describe('OAuthMfaDialog', () => {
  it('should render when the dialog is open', () => {
    renderComponent()
    expect(screen.getByTestId('oauth-mfa-dialog')).toBeInTheDocument()
  })

  it('should not render when the dialog is closed', () => {
    ;(oauthCloudMfaSelector as jest.Mock).mockReturnValueOnce({
      ...mockMfaOpenState,
      isOpenDialog: false,
    })
    renderComponent()
    expect(screen.queryByTestId('oauth-mfa-dialog')).not.toBeInTheDocument()
  })

  it('should keep verify disabled until the code is complete', () => {
    renderComponent()
    const submitEl = screen.getByTestId('oauth-mfa-dialog-submit-btn')

    expect(submitEl).toBeDisabled()

    fireEvent.paste(screen.getByTestId('oauth-mfa-dialog-code-input-0'), {
      clipboardData: { getData: () => '123' },
    })
    expect(submitEl).toBeDisabled()
  })

  it('should auto-submit and call onVerified when the last digit is entered', async () => {
    apiService.post = jest.fn().mockResolvedValue({ status: 200 })
    const onVerified = jest.fn()

    renderComponent({ onVerified })

    // five digits in, then the sixth completes the code and triggers auth
    fireEvent.paste(screen.getByTestId('oauth-mfa-dialog-code-input-0'), {
      clipboardData: { getData: () => '12345' },
    })
    expect(apiService.post).not.toBeCalled()

    await act(() => {
      fireEvent.change(screen.getByTestId('oauth-mfa-dialog-code-input-5'), {
        target: { value: '6' },
      })
    })

    expect(apiService.post).toBeCalledWith(
      expect.stringContaining('login/mfa'),
      { code: '123456' },
    )
    const expectedActions = [submitMfaCode(), submitMfaCodeSuccess()]
    expect(store.getActions()).toEqual(expectedActions)
    expect(onVerified).toBeCalled()
  })

  it('should auto-submit when a full code is pasted', async () => {
    apiService.post = jest.fn().mockResolvedValue({ status: 200 })
    const onVerified = jest.fn()

    renderComponent({ onVerified })

    await act(() => {
      fireEvent.paste(screen.getByTestId('oauth-mfa-dialog-code-input-0'), {
        clipboardData: { getData: () => '123456' },
      })
    })

    expect(apiService.post).toBeCalledWith(
      expect.stringContaining('login/mfa'),
      { code: '123456' },
    )
    expect(onVerified).toBeCalled()
  })

  it('should close the dialog and reset the oauth source on cancel', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('oauth-mfa-dialog-cancel-btn'))

    const expectedActions = [
      setMfaDialogState(false),
      setOAuthCloudSource(null),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should show the inline error', () => {
    ;(oauthCloudMfaSelector as jest.Mock).mockReturnValueOnce({
      ...mockMfaOpenState,
      error: 'Invalid code',
    })
    renderComponent()

    expect(screen.getByTestId('oauth-mfa-dialog-error')).toHaveTextContent(
      'Invalid code',
    )
  })

  it('should reset the error when the user edits the code after a failure', () => {
    ;(oauthCloudMfaSelector as jest.Mock).mockReturnValue({
      ...mockMfaOpenState,
      error: 'Invalid code',
    })
    renderComponent()

    fireEvent.change(screen.getByTestId('oauth-mfa-dialog-code-input-0'), {
      target: { value: '1' },
    })

    expect(store.getActions()).toContainEqual(resetMfaError())
  })
})
