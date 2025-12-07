import React from 'react'
import { cloneDeep } from 'lodash'

import {
  cleanup,
  mockedStore,
  render,
  screen,
  userEvent,
} from 'uiSrc/utils/test-utils'
import { ADD_KEY_TYPE_OPTIONS } from 'uiSrc/pages/browser/components/add-key/constants/key-type-options'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  OAuthSocialAction,
  OAuthSocialSource,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'
import * as appFeaturesSlice from 'uiSrc/slices/app/features'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import AddKey from './AddKey'

const handleAddKeyPanelMock = () => {}
const handleCloseKeyMock = () => {}

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1',
    modules: [],
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('AddKey', () => {
  it('should render', () => {
    expect(
      render(
        <AddKey
          onAddKeyPanel={handleAddKeyPanelMock}
          onClosePanel={handleCloseKeyMock}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render type select label', () => {
    render(
      <AddKey
        onAddKeyPanel={handleAddKeyPanelMock}
        onClosePanel={handleCloseKeyMock}
      />,
    )

    expect(screen.getByText(/Key Type\*/i)).toBeInTheDocument()
  })

  it('should have key type select with predefined first value from options', () => {
    render(
      <AddKey
        onAddKeyPanel={handleAddKeyPanelMock}
        onClosePanel={handleCloseKeyMock}
      />,
    )

    expect(
      screen.getByTestId(ADD_KEY_TYPE_OPTIONS[0].value),
    ).toBeInTheDocument()
  })

  it('should show text if db not contains ReJSON module', async () => {
    render(
      <AddKey
        onAddKeyPanel={handleAddKeyPanelMock}
        onClosePanel={handleCloseKeyMock}
      />,
    )

    await userEvent.click(screen.getByTestId('select-key-type'))
    await userEvent.click((await screen.findByText('JSON')) || document)

    expect(screen.getByTestId('json-not-loaded-text')).toBeInTheDocument()
  })

  it('should dispatch open oauth modal open actions if db not contains ReJSON module and has cloudSso is enabled', async () => {
    jest
      .spyOn(appFeaturesSlice, 'appFeatureFlagsFeaturesSelector')
      .mockReturnValue({
        cloudSso: {
          flag: true,
        },
        cloudAds: {
          flag: true,
        },
      })

    render(
      <AddKey
        onAddKeyPanel={handleAddKeyPanelMock}
        onClosePanel={handleCloseKeyMock}
      />,
    )
    const afterRenderActions = [...store.getActions()]

    await userEvent.click(screen.getByTestId('select-key-type'))
    await userEvent.click((await screen.findByText('JSON')) || document)

    await userEvent.click(screen.getByTestId('guide-free-database-link'))

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(OAuthSocialSource.BrowserRedisJSON),
    ]
    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      ...expectedActions,
    ])
  })

  it('should not show text if db contains ReJSON module', async () => {
    ;(connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      modules: [
        { name: RedisDefaultModules.FT },
        { name: RedisDefaultModules.ReJSON },
      ],
    }))

    render(
      <AddKey
        onAddKeyPanel={handleAddKeyPanelMock}
        onClosePanel={handleCloseKeyMock}
      />,
    )

    await userEvent.click(screen.getByTestId('select-key-type'))
    await userEvent.click((await screen.findByText('JSON')) || document)
    expect(screen.queryByTestId('json-not-loaded-text')).not.toBeInTheDocument()
  })
})
