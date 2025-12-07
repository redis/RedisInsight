import { cloneDeep } from 'lodash'
import React from 'react'

import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { localStorageService } from 'uiSrc/services'
import { setAgreement } from 'uiSrc/slices/oauth/cloud'
import { BrowserStorageItem } from 'uiSrc/constants'
import OAuthAgreement from './OAuthAgreement'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
  },
}))

describe('OAuthAgreement', () => {
  it('should render', () => {
    expect(render(<OAuthAgreement />)).toBeTruthy()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeChecked()
  })

  it('should call setAgreement and set value in local storage', () => {
    localStorageService.set = jest.fn()

    render(<OAuthAgreement />)

    fireEvent.click(screen.getByTestId('oauth-agreement-checkbox'))

    const expectedActions = [setAgreement(false)]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )

    expect(localStorageService.set).toBeCalledWith(
      BrowserStorageItem.OAuthAgreement,
      false,
    )
  })
})
