import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  createFreeDbJob,
  fetchPlans,
  fetchUserInfo,
  setJob,
  setOAuthCloudSource,
  setSocialDialogState,
  showOAuthProgress,
  signInFailure,
} from 'uiSrc/slices/oauth/cloud'
import { BrowserStorageItem, Pages } from 'uiSrc/constants'
import {
  cloudSelector,
  fetchSubscriptionsRedisCloud,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import {
  CloudAuthResponse,
  CloudAuthStatus,
  CloudJobName,
  CloudJobStep,
} from 'uiSrc/electron/constants'
import {
  addErrorNotification,
  addInfiniteNotification,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import { parseCustomError } from 'uiSrc/utils'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import { localStorageService } from 'uiSrc/services'
import { CustomError, OAuthSocialAction } from 'uiSrc/slices/interfaces'

const ConfigOAuth = () => {
  const { ssoFlow, isRecommendedSettings } = useSelector(cloudSelector)

  const ssoFlowRef = useRef(ssoFlow)
  const isRecommendedSettingsRef = useRef(isRecommendedSettings)
  const isFlowInProgress = useRef(false)

  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    window.app?.cloudOauthCallback?.(cloudOauthCallback)
  }, [])

  useEffect(() => {
    ssoFlowRef.current = ssoFlow

    if (!ssoFlow) {
      isFlowInProgress.current = false
    }
  }, [ssoFlow])

  useEffect(() => {
    isRecommendedSettingsRef.current = isRecommendedSettings
  }, [isRecommendedSettings])

  const fetchUserInfoSuccess = (isSelectAccout: boolean) => {
    if (isSelectAccout) return

    if (ssoFlowRef.current === OAuthSocialAction.SignIn) {
      dispatch(setSSOFlow(undefined))
      closeInfinityNotification()
      return
    }

    dispatch(
      addInfiniteNotification(
        INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
      ),
    )

    if (ssoFlowRef.current === OAuthSocialAction.Import) {
      dispatch(
        fetchSubscriptionsRedisCloud(
          null,
          true,
          () => {
            closeInfinityNotification()
            history.push(Pages.redisCloudSubscriptions)
          },
          closeInfinityNotification,
        ),
      )
      return
    }

    if (isRecommendedSettingsRef.current) {
      dispatch(
        createFreeDbJob({
          name: CloudJobName.CreateFreeSubscriptionAndDatabase,
          resources: {
            isRecommendedSettings: isRecommendedSettingsRef.current,
          },
          onSuccessAction: () => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
              ),
            )
          },
          onFailAction: closeInfinityNotification,
        }),
      )

      return
    }

    dispatch(fetchPlans())
  }

  const closeInfinityNotification = () => {
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
  }

  const cloudOauthCallback = (
    _e: any,
    { status, message = '', error }: CloudAuthResponse,
  ) => {
    if (status === CloudAuthStatus.Succeed) {
      dispatch(
        setJob({
          id: '',
          name: CloudJobName.CreateFreeSubscriptionAndDatabase,
          status: '',
        }),
      )
      localStorageService.remove(BrowserStorageItem.OAuthJobId)
      dispatch(showOAuthProgress(true))
      dispatch(addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()))
      dispatch(setSocialDialogState(null))
      dispatch(fetchUserInfo(fetchUserInfoSuccess, closeInfinityNotification))
      isFlowInProgress.current = true
    }

    if (status === CloudAuthStatus.Failed) {
      // don't do anything, because we are processing something
      // covers situation when were made several clicks on the same time
      if (isFlowInProgress.current) {
        return
      }

      const err = parseCustomError((error as CustomError) || message || '')
      dispatch(setOAuthCloudSource(null))
      dispatch(signInFailure(err?.response?.data?.message || message))
      dispatch(addErrorNotification(err))
    }
  }

  return null
}

export default ConfigOAuth
