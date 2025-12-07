import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'
import OAuthSsoDialog from './OAuthSsoDialog'

jest.mock('uiSrc/slices/instances/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/instances/cloud'),
  cloudSelector: jest.fn().mockReturnValue({
    ssoFlow: '',
  }),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    isOpenSocialDialog: true,
    source: 'source',
  }),
}))

describe('OAuthSsoDialog', () => {
  it('should render', () => {
    expect(render(<OAuthSsoDialog />)).toBeTruthy()
  })

  it('should render proper modal with ssoFlow = OAuthSocialAction.Create', () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      ssoFlow: OAuthSocialAction.Create,
    })
    render(<OAuthSsoDialog />)

    expect(screen.getByTestId('oauth-container-create-db')).toBeInTheDocument()
  })

  it('should render proper modal with ssoFlow = OAuthSocialAction.Import', () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      ssoFlow: OAuthSocialAction.Import,
    })
    render(<OAuthSsoDialog />)

    expect(screen.getByTestId('oauth-container-signIn')).toBeInTheDocument()
  })

  it('should render proper modal with ssoFlow = OAuthSocialAction.SignIn', () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      ssoFlow: OAuthSocialAction.SignIn,
    })
    render(<OAuthSsoDialog />)

    expect(screen.getByTestId('oauth-container-signIn')).toBeInTheDocument()
  })
})
