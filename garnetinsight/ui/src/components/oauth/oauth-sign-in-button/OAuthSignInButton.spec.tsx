import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import OAuthSignInButton, { Props } from './OAuthSignInButton'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: true,
    },
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthSignInButton', () => {
  it('should render', () => {
    expect(render(<OAuthSignInButton {...mockedProps} />)).toBeTruthy()
  })

  it('should call proper actions after click on sign in button', () => {
    render(
      <OAuthSignInButton {...mockedProps} source={OAuthSocialSource.Browser} />,
    )

    fireEvent.click(screen.getByTestId('cloud-sign-in-btn'))

    expect(store.getActions()).toEqual([
      setSSOFlow(OAuthSocialAction.SignIn),
      setSocialDialogState(OAuthSocialSource.Browser),
    ])
  })
})
