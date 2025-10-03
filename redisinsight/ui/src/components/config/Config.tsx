import { useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { isNumber } from 'lodash'
import { BrowserStorageItem, FeatureFlags, Theme } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { localStorageService, setObjectStorage } from 'uiSrc/services'

import {
  appFeatureFlagsFeaturesSelector,
  setFeaturesToHighlight,
  setOnboarding,
} from 'uiSrc/slices/app/features'
import { fetchNotificationsAction } from 'uiSrc/slices/app/notifications'

import {
  fetchUserConfigSettings,
  fetchUserSettingsSpec,
  userSettingsSelector,
  setSettingsPopupState,
} from 'uiSrc/slices/user/user-settings'
import {
  fetchServerInfo,
  appServerInfoSelector,
  setServerLoaded,
} from 'uiSrc/slices/app/info'

import { isDifferentConsentsExists } from 'uiSrc/utils'
import { fetchUnsupportedCliCommandsAction } from 'uiSrc/slices/cli/cli-settings'
import { fetchRedisCommandsInfo } from 'uiSrc/slices/app/redis-commands'
import { fetchTutorials } from 'uiSrc/slices/workbench/wb-tutorials'
import { fetchCustomTutorials } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { fetchContentRecommendations } from 'uiSrc/slices/recommendations/recommendations'
import { fetchGuideLinksAction } from 'uiSrc/slices/content/guide-links'
import { setCapability } from 'uiSrc/slices/app/context'

import { fetchProfile } from 'uiSrc/slices/oauth/cloud'
import { fetchDBSettings } from 'uiSrc/slices/app/db-settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DatabaseSettingsData } from 'uiSrc/slices/interfaces'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

const SETTINGS_PAGE_PATH = '/settings'
const Config = () => {
  const serverInfo = useSelector(appServerInfoSelector)
  const { id } = useSelector(connectedInstanceSelector)
  const { config, spec } = useSelector(userSettingsSelector)
  const {
    [FeatureFlags.cloudSso]: cloudSsoFeature,
    [FeatureFlags.envDependent]: envDependentFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const { changeTheme } = useContext(ThemeContext)
  const { pathname } = useLocation()

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(
      setCapability(localStorageService?.get(BrowserStorageItem.capability)),
    )
    if (envDependentFeature?.flag) {
      dispatch(fetchServerInfo())
      dispatch(fetchNotificationsAction())
      dispatch(fetchCustomTutorials())
    } else {
      dispatch(setServerLoaded())
    }

    dispatch(fetchUnsupportedCliCommandsAction())
    dispatch(fetchRedisCommandsInfo())
    dispatch(fetchContentRecommendations())
    dispatch(fetchGuideLinksAction())

    // get tutorials
    dispatch(fetchTutorials())

    // fetch config settings, after that take spec
    if (pathname !== SETTINGS_PAGE_PATH) {
      dispatch(
        fetchUserConfigSettings(() => {
          if (envDependentFeature?.flag) {
            dispatch(fetchUserSettingsSpec())
          }
        }),
      )
    }
  }, [])

  useEffect(() => {
    if (id) {
      // fetch db settings and store them in local storage
      dispatch(
        fetchDBSettings(
          id,
          (payload: { id: string; data: DatabaseSettingsData }) => {
            // set DB Config Storage
            setObjectStorage(
              BrowserStorageItem.dbConfig + payload.id,
              payload.data,
            )
          },
        ),
      )
    }
  }, [id])

  useEffect(() => {
    if (config) {
      checkAndSetTheme()
    }
  }, [config])

  useEffect(() => {
    if (config && spec && envDependentFeature?.flag) {
      checkSettingsToShowPopup()
    }
  }, [spec])

  useEffect(() => {
    if (cloudSsoFeature?.flag) {
      dispatch(fetchProfile())
    }
  }, [cloudSsoFeature?.flag])

  useEffect(() => {
    featuresHighlight()
    onboardUsers()
  }, [serverInfo, config])

  const featuresHighlight = () => {
    if (serverInfo?.buildType === BuildType.Electron && config) {
      // new user, set all features as viewed
      if (!config.agreements) {
        updateHighlightingFeatures({
          version: serverInfo.appVersion,
          features: [],
        })
        return
      }

      const userFeatures = localStorageService.get(
        BrowserStorageItem.featuresHighlighting,
      )

      // existing user with the same version of app, get not viewed features from LS
      if (userFeatures?.version === serverInfo.appVersion) {
        dispatch(setFeaturesToHighlight(userFeatures))
        return
      }

      // existing user, no any new features viewed (after application update e.g.)
      updateHighlightingFeatures({
        version: serverInfo.appVersion,
        features: Object.keys(BUILD_FEATURES),
      })
    }
  }

  const updateHighlightingFeatures = (data: {
    version: string
    features: string[]
  }) => {
    dispatch(setFeaturesToHighlight(data))
    localStorageService.set(BrowserStorageItem.featuresHighlighting, data)
  }

  const onboardUsers = () => {
    if (config) {
      const totalSteps = Object.keys(ONBOARDING_FEATURES).length
      const userCurrentStep = localStorageService.get(
        BrowserStorageItem.onboardingStep,
      )

      // start onboarding for new electron users
      if (serverInfo?.buildType === BuildType.Electron && !config.agreements) {
        dispatch(
          setOnboarding({
            currentStep: 0,
            totalSteps,
          }),
        )

        return
      }

      // continue onboarding for all users
      if (isNumber(userCurrentStep)) {
        dispatch(
          setOnboarding({
            currentStep: userCurrentStep,
            totalSteps,
          }),
        )
      }
    }
  }

  const checkSettingsToShowPopup = () => {
    const specConsents = spec?.agreements
    const appliedConsents = config?.agreements
    dispatch(
      setSettingsPopupState(
        config?.acceptTermsAndConditionsOverwritten ? false : isDifferentConsentsExists(specConsents, appliedConsents),
      ),
    )
  }

  const checkAndSetTheme = () => {
    const theme = config?.theme
    if (theme && localStorageService.get(BrowserStorageItem.theme) !== theme)
      changeTheme(theme)
  }

  return null
}

export default Config
