import React from 'react'
import { render, fireEvent, screen } from 'uiSrc/utils/test-utils'
import { OAuthStrategy } from 'uiSrc/slices/interfaces'
import OAuthSocialButtons from './OAuthSocialButtons'

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
}))

const onClick = jest.fn()

describe('OAuthSocialButtons', () => {
  it('should render', () => {
    expect(render(<OAuthSocialButtons />)).toBeTruthy()
  })

  it('should call proper actions after click on google', () => {
    render(<OAuthSocialButtons onClick={onClick} />)

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(onClick).toBeCalledWith(OAuthStrategy.Google)
  })

  it('should call proper actions after click on github', () => {
    render(<OAuthSocialButtons onClick={onClick} />)

    fireEvent.click(screen.getByTestId('github-oauth'))

    expect(onClick).toBeCalledWith(OAuthStrategy.GitHub)
  })

  it('should call proper actions after click on sso', () => {
    render(<OAuthSocialButtons onClick={onClick} />)

    fireEvent.click(screen.getByTestId('sso-oauth'))

    expect(onClick).toBeCalledWith(OAuthStrategy.SSO)
  })
})
