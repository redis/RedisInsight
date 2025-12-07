import React from 'react'

import { RdiInstance } from 'uiSrc/slices/interfaces'
import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import ConnectionForm, { Props } from './ConnectionForm'

const mockedProps: Props = {
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  isLoading: false,
  editInstance: null,
}

const mockedEditInstance: RdiInstance = {
  id: '1',
  name: 'name',
  url: 'url',
  username: 'username',
  password: 'password',
  error: '',
  loading: false,
}

describe('ConnectionForm', () => {
  it('should render', () => {
    expect(render(<ConnectionForm {...mockedProps} />)).toBeTruthy()
  })

  it('should disable submit button when form is invalid', async () => {
    render(
      <>
        <ConnectionForm {...mockedProps} />
        <div id="footerDatabaseForm" />
      </>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('connection-form-add-button')).toBeDisabled()
    })
  })

  // TODO update when add test connection endpoint
  it.skip('should disable test connection button when form is invalid', async () => {
    render(
      <>
        <ConnectionForm {...mockedProps} />
        <div id="footerDatabaseForm" />
      </>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('connection-form-test-button')).toBeDisabled()
    })
  })

  it('should not disable submit button when form is valid', async () => {
    render(
      <>
        <ConnectionForm {...mockedProps} />
        <div id="footerDatabaseForm" />
      </>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('connection-form-add-button')).toBeDisabled()
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('connection-form-name-input'), {
        target: { value: 'alias' },
      })
      fireEvent.change(screen.getByTestId('connection-form-url-input'), {
        target: { value: 'url' },
      })
      fireEvent.change(screen.getByTestId('connection-form-username-input'), {
        target: { value: 'username' },
      })
      fireEvent.change(screen.getByTestId('connection-form-password-input'), {
        target: { value: 'password' },
      })
    })

    expect(screen.getByTestId('connection-form-add-button')).not.toBeDisabled()
  })

  it('should not disable submit button when form is provided editInstance', async () => {
    render(
      <>
        <ConnectionForm {...mockedProps} editInstance={mockedEditInstance} />
        <div id="footerDatabaseForm" />
      </>,
    )

    expect(screen.getByTestId('connection-form-add-button')).not.toBeDisabled()
  })

  it('should disable URL input when form is provided editInstance', () => {
    render(
      <>
        <ConnectionForm {...mockedProps} editInstance={mockedEditInstance} />
        <div id="footerDatabaseForm" />
      </>,
    )

    expect(screen.getByTestId('connection-form-url-input')).toBeDisabled()
  })

  it('should show validation tooltip when submit button is disabled', async () => {
    render(
      <>
        <ConnectionForm {...mockedProps} />
        <div id="footerDatabaseForm" />
      </>,
    )

    fireEvent.focus(screen.getByTestId('connection-form-add-button'))

    const tooltip = await screen.findByTestId(
      'connection-form-validation-tooltip',
    )

    expect(tooltip).toBeInTheDocument()
  })

  it.skip('should show validation tooltip when test connection button is disabled', async () => {
    render(
      <>
        <ConnectionForm {...mockedProps} />
        <div id="footerDatabaseForm" />
      </>,
    )

    fireEvent.focus(screen.getByTestId('connection-form-test-button'))

    const tooltip = await screen.findByTestId(
      'connection-form-validation-tooltip',
    )

    expect(tooltip).toBeInTheDocument()
  })

  it('should disable submit button when isLoading = true', async () => {
    render(
      <>
        <ConnectionForm {...mockedProps} isLoading />
        <div id="footerDatabaseForm" />
      </>,
    )

    expect(screen.getByTestId('connection-form-add-button')).toBeDisabled()
  })

  it.skip('should disable test connection button when isLoading = true', async () => {
    render(
      <>
        <ConnectionForm {...mockedProps} isLoading />
        <div id="footerDatabaseForm" />
      </>,
    )

    expect(screen.getByTestId('connection-form-test-button')).toBeDisabled()
  })
})
