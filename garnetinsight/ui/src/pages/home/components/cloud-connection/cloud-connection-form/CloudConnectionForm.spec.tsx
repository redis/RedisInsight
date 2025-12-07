import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import CloudConnectionForm, { Props } from './CloudConnectionForm'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: false,
    },
  }),
}))

describe('CloudConnectionForm', () => {
  it('should render', () => {
    expect(
      render(<CloudConnectionForm {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should not render cloud sso form by default', () => {
    render(<CloudConnectionForm {...instance(mockedProps)} />)
    expect(screen.getByTestId('access-key')).toBeInTheDocument()
    expect(screen.getByTestId('secret-key')).toBeInTheDocument()
  })

  it('should render cloud sso form with feature flag', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: {
        flag: true,
      },
    })

    render(<CloudConnectionForm {...instance(mockedProps)} />)

    expect(
      screen.getByTestId('oauth-container-social-buttons'),
    ).toBeInTheDocument()
  })
})
