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

import { AddDbType } from 'uiSrc/pages/home/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import ConnectivityOptions, { Props } from './ConnectivityOptions'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: false,
    },
    cloudAds: {
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

describe('ConnectivityOptions', () => {
  it('should render', () => {
    expect(render(<ConnectivityOptions {...mockedProps} />)).toBeTruthy()
  })

  it('should render all additional options', () => {
    const onClickOption = jest.fn()
    render(
      <ConnectivityOptions {...mockedProps} onClickOption={onClickOption} />,
    )

    fireEvent.click(screen.getByTestId('option-btn-sentinel'))
    expect(onClickOption).toBeCalledWith(AddDbType.sentinel)

    fireEvent.click(screen.getByTestId('option-btn-software'))
    expect(onClickOption).toBeCalledWith(AddDbType.software)

    fireEvent.click(screen.getByTestId('option-btn-import'))
    expect(onClickOption).toBeCalledWith(AddDbType.import)

    fireEvent.click(screen.getByTestId('discover-cloud-btn'))
    expect(onClickOption).toBeCalledWith(AddDbType.cloud)
  })

  it('should not call any actions after click on create cloud btn', () => {
    render(<ConnectivityOptions {...mockedProps} />)

    fireEvent.click(screen.getByTestId('create-free-db-btn'))

    expect(store.getActions()).toEqual([])
  })

  it('should call proper actions after click on create cloud btn', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: {
        flag: true,
      },
      cloudAds: {
        flag: true,
      },
    })

    const onClose = jest.fn()
    render(<ConnectivityOptions {...mockedProps} onClose={onClose} />)

    fireEvent.click(screen.getByTestId('create-free-db-btn'))

    expect(store.getActions()).toEqual([
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(OAuthSocialSource.AddDbForm),
    ])
    expect(onClose).toBeCalled()
  })

  it('should not should create free db button if cloud ads feature flag is disabled', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: {
        flag: true,
      },
      cloudAds: {
        flag: false,
      },
    })

    const onClose = jest.fn()
    render(<ConnectivityOptions {...mockedProps} onClose={onClose} />)

    expect(screen.queryByTestId('create-free-db-btn')).not.toBeInTheDocument()
  })
})
