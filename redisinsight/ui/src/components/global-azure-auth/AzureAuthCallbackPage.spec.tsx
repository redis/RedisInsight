import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import AzureAuthCallbackPage from './AzureAuthCallbackPage'

describe('AzureAuthCallbackPage', () => {
  const mockClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    window.close = mockClose
  })

  it('should render authentication complete message', () => {
    const { getByText } = render(<AzureAuthCallbackPage />)

    expect(getByText('✓ Authentication Complete')).toBeInTheDocument()
    expect(
      getByText('This window will close automatically...'),
    ).toBeInTheDocument()
  })
})
