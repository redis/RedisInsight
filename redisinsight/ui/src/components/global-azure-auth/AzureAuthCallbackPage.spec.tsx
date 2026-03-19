import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { AzureAuthStatus } from 'apiSrc/modules/azure/constants'

import AzureAuthCallbackPage from './AzureAuthCallbackPage'

describe('AzureAuthCallbackPage', () => {
  const mockClose = jest.fn()
  const originalLocation = window.location

  beforeEach(() => {
    jest.clearAllMocks()
    window.close = mockClose
    localStorage.clear()
  })

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  const setLocationWithResult = (result: object) => {
    const encodedResult = encodeURIComponent(
      btoa(unescape(encodeURIComponent(JSON.stringify(result)))),
    )
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: `http://localhost/azure-auth-callback?result=${encodedResult}`,
        search: `?result=${encodedResult}`,
      },
      writable: true,
    })
  }

  it('should render returning message with valid result', () => {
    setLocationWithResult({
      status: AzureAuthStatus.Succeed,
      account: { id: 'test-id', username: 'test@example.com' },
    })

    const { getByText } = render(<AzureAuthCallbackPage />)

    expect(getByText('Returning to RedisInsight...')).toBeInTheDocument()
    expect(
      getByText('This window will close automatically'),
    ).toBeInTheDocument()
  })

  it('should render error message when result parameter is missing', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: 'http://localhost/azure-auth-callback',
        search: '',
      },
      writable: true,
    })

    const { getByText } = render(<AzureAuthCallbackPage />)

    expect(getByText('✕ Something went wrong')).toBeInTheDocument()
    expect(
      getByText('This window will close automatically...'),
    ).toBeInTheDocument()
  })

  it('should render error message when result is invalid base64', () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: 'http://localhost/azure-auth-callback?result=invalid-base64!!!',
        search: '?result=invalid-base64!!!',
      },
      writable: true,
    })

    const { getByText } = render(<AzureAuthCallbackPage />)

    expect(getByText('✕ Something went wrong')).toBeInTheDocument()
  })
})
