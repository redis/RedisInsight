import React from 'react'
import { cloneDeep, set } from 'lodash'
import { waitFor } from '@testing-library/react'
import { BuildType } from 'uiSrc/constants/env'
import { localStorageService } from 'uiSrc/services'
import {
  setFeaturesToHighlight,
  setOnboarding,
} from 'uiSrc/slices/app/features'
import { getNotifications } from 'uiSrc/slices/app/notifications'
import {
  render,
  mockedStore,
  cleanup,
  MOCKED_HIGHLIGHTING_FEATURES,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'

import {
  getUserConfigSettings,
  getUserSettingsSpec,
  setSettingsPopupState,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'
import {
  appServerInfoSelector,
  getServerInfo,
  setServerLoaded,
} from 'uiSrc/slices/app/info'
import { processCliClient } from 'uiSrc/slices/cli/cli-settings'
import { getRedisCommands } from 'uiSrc/slices/app/redis-commands'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { getWBTutorials } from 'uiSrc/slices/workbench/wb-tutorials'
import { getContentRecommendations } from 'uiSrc/slices/recommendations/recommendations'
import { getGuideLinks } from 'uiSrc/slices/content/guide-links'
import { getWBCustomTutorials } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import { setCapability } from 'uiSrc/slices/app/context'
import { FeatureFlags } from 'uiSrc/constants'
import Config from './Config'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsSelector: jest.fn().mockReturnValue({
    config: {
      agreements: {},
    },
    spec: {
      agreements: {},
    },
  }),
}))

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appServerInfoSelector: jest.fn(),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

const onboardingTotalSteps = Object.keys(ONBOARDING_FEATURES)?.length

describe('Config', () => {
  it('should render with spec call', async () => {
    set(
      store,
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(<Config />)
    const afterRenderActions = [
      setCapability(),
      getServerInfo(),
      getNotifications(),
      getWBCustomTutorials(),
      processCliClient(),
      getRedisCommands(),
      getContentRecommendations(),
      getGuideLinks(),
      getWBTutorials(),
      getUserConfigSettings(),
      setSettingsPopupState(false),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])
    await waitFor(() =>
      expect(store.getActions()).toContainEqual(getUserSettingsSpec()),
    )
  })

  it('should render w/o settings spec call', async () => {
    set(
      store,
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    render(<Config />)

    const afterRenderActions = [
      setCapability(),
      getServerInfo(),
      getNotifications(),
      getWBCustomTutorials(),
      processCliClient(),
      getRedisCommands(),
      getContentRecommendations(),
      getGuideLinks(),
      getWBTutorials(),
      getUserConfigSettings(),
      setSettingsPopupState(false),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])
    await waitFor(() =>
      expect(store.getActions()).not.toContainEqual(getUserSettingsSpec()),
    )
  })

  it('should render expected actions when envDependent feature is off', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )
    const mockedStore = mockStore(initialStoreState)

    render(<Config />, { store: mockedStore })
    const afterRenderActions = [
      setCapability(),
      setServerLoaded(),
      processCliClient(),
      getRedisCommands(),
      getContentRecommendations(),
      getGuideLinks(),
      getWBTutorials(),
      getUserConfigSettings(),
    ]
    expect(mockedStore.getActions()).toEqual([...afterRenderActions])
  })

  it('should call the list of actions', () => {
    const userSettingsSelectorMock = jest.fn().mockReturnValue({
      config: {
        agreements: {},
      },
      spec: {
        agreements: {
          eula: {
            defaultValue: false,
            required: true,
            editable: false,
            since: '1.0.0',
            title: 'EULA: Garnet Insight License Terms',
            label: 'Label',
          },
        },
      },
    })
    userSettingsSelector.mockImplementation(userSettingsSelectorMock)
    render(<Config />)
    const afterRenderActions = [
      setCapability(),
      getServerInfo(),
      getNotifications(),
      getWBCustomTutorials(),
      processCliClient(),
      getRedisCommands(),
      getContentRecommendations(),
      getGuideLinks(),
      getWBTutorials(),
      getUserConfigSettings(),
      setSettingsPopupState(true),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])
  })

  it('should call updateHighlightingFeatures for new user with empty features', () => {
    const userSettingsSelectorMock = jest.fn().mockReturnValue({
      config: {
        agreements: null,
      },
    })
    const appServerInfoSelectorMock = jest.fn().mockReturnValue({
      buildType: BuildType.Electron,
      appVersion: '2.0.0',
    })
    userSettingsSelector.mockImplementation(userSettingsSelectorMock)
    appServerInfoSelector.mockImplementation(appServerInfoSelectorMock)

    render(<Config />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setFeaturesToHighlight({ version: '2.0.0', features: [] }),
      ]),
    )
  })

  it('should call updateHighlightingFeatures for existing user with proper data', () => {
    const userSettingsSelectorMock = jest.fn().mockReturnValue({
      config: {
        agreements: {},
      },
    })
    const appServerInfoSelectorMock = jest.fn().mockReturnValue({
      buildType: BuildType.Electron,
      appVersion: '2.0.0',
    })
    userSettingsSelector.mockImplementation(userSettingsSelectorMock)
    appServerInfoSelector.mockImplementation(appServerInfoSelectorMock)

    render(<Config />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setFeaturesToHighlight({
          version: '2.0.0',
          features: MOCKED_HIGHLIGHTING_FEATURES,
        }),
      ]),
    )
  })

  it('should call updateHighlightingFeatures for existing user with proper data with features from LS', () => {
    localStorageService.get = jest
      .fn()
      .mockReturnValue({ version: '2.0.0', features: ['importDatabases'] })
    const userSettingsSelectorMock = jest.fn().mockReturnValue({
      config: {
        agreements: {},
      },
    })
    const appServerInfoSelectorMock = jest.fn().mockReturnValue({
      buildType: BuildType.Electron,
      appVersion: '2.0.0',
    })
    userSettingsSelector.mockImplementation(userSettingsSelectorMock)
    appServerInfoSelector.mockImplementation(appServerInfoSelectorMock)

    render(<Config />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setFeaturesToHighlight({
          version: '2.0.0',
          features: ['importDatabases'],
        }),
      ]),
    )
  })

  it('should call updateHighlightingFeatures for existing user with proper data with features from LS for different version', () => {
    localStorageService.get = jest
      .fn()
      .mockReturnValue({ version: '2.0.0', features: ['importDatabases'] })
    const userSettingsSelectorMock = jest.fn().mockReturnValue({
      config: {
        agreements: {},
      },
    })
    const appServerInfoSelectorMock = jest.fn().mockReturnValue({
      buildType: BuildType.Electron,
      appVersion: '2.0.12',
    })
    userSettingsSelector.mockImplementation(userSettingsSelectorMock)
    appServerInfoSelector.mockImplementation(appServerInfoSelectorMock)

    render(<Config />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setFeaturesToHighlight({
          version: '2.0.12',
          features: MOCKED_HIGHLIGHTING_FEATURES,
        }),
      ]),
    )
  })

  it('should call setOnboarding for new user', () => {
    const userSettingsSelectorMock = jest.fn().mockReturnValue({
      config: {
        agreements: null,
      },
    })
    const appServerInfoSelectorMock = jest.fn().mockReturnValue({
      buildType: BuildType.Electron,
    })
    userSettingsSelector.mockImplementation(userSettingsSelectorMock)
    appServerInfoSelector.mockImplementation(appServerInfoSelectorMock)

    render(<Config />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setOnboarding({ currentStep: 0, totalSteps: onboardingTotalSteps }),
      ]),
    )
  })

  it('should call setOnboarding for existing user with not completed process', () => {
    localStorageService.get = jest.fn().mockReturnValue(5)
    const userSettingsSelectorMock = jest.fn().mockReturnValue({
      config: {
        agreements: {},
      },
    })
    const appServerInfoSelectorMock = jest.fn().mockReturnValue({
      buildType: BuildType.Electron,
    })
    userSettingsSelector.mockImplementation(userSettingsSelectorMock)
    appServerInfoSelector.mockImplementation(appServerInfoSelectorMock)

    render(<Config />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setOnboarding({ currentStep: 5, totalSteps: onboardingTotalSteps }),
      ]),
    )
  })

  it('should not show consent popup when acceptTermsAndConditionsOverwritten is true, regardless of consent differences', () => {
    const userSettingsSelectorMock = jest.fn().mockReturnValue({
      config: {
        acceptTermsAndConditionsOverwritten: true,
        agreements: {}, // Empty agreements - would normally cause a popup
      },
      spec: {
        agreements: {
          eula: {
            defaultValue: false,
            required: true,
            editable: false,
            since: '1.0.0',
            title: 'EULA: Garnet Insight License Terms',
            label: 'Label',
          },
        },
      },
    })
    userSettingsSelector.mockImplementation(userSettingsSelectorMock)
    
    render(<Config />)
    
    // Check that setSettingsPopupState is called with false
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        setSettingsPopupState(false),
      ])
    )
  })
})
