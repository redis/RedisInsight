import { useDispatch, useSelector } from 'react-redux'
import React from 'react'

import { useHistory } from 'react-router-dom'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  oauthCloudUserSelector,
  setSocialDialogState,
} from 'uiSrc/slices/oauth/cloud'
import {
  fetchSubscriptionsRedisCloud,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import { Maybe } from 'uiSrc/utils'

export interface Props {
  children: (
    ssoCloudHandlerClick: (
      e: React.MouseEvent,
      {
        source,
        action,
      }: { source: OAuthSocialSource; action?: Maybe<OAuthSocialAction> },
      telemetrySource?: string,
    ) => void,
    isSSOEnabled: boolean,
  ) => React.ReactElement
}

const telemetryEventByAction = {
  [OAuthSocialAction.SignIn]: TelemetryEvent.CLOUD_SIGN_IN_CLICKED,
  [OAuthSocialAction.Create]: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
  [OAuthSocialAction.Import]: TelemetryEvent.CLOUD_IMPORT_DATABASES_CLICKED,
}

const OAuthSsoHandlerDialog = ({ children }: Props) => {
  const { data } = useSelector(oauthCloudUserSelector)
  const { [FeatureFlags.cloudSso]: feature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const dispatch = useDispatch()
  const history = useHistory()

  const ssoCloudHandlerClick = (
    e: React.MouseEvent,
    {
      source,
      action,
    }: { source: OAuthSocialSource; action?: Maybe<OAuthSocialAction> },
    telemetrySource?: string,
  ) => {
    const isCloudSsoEnabled = !!feature?.flag

    // if (!isCloudSsoEnabled) {
    //   return
    // }
    e?.preventDefault()

    if (action === OAuthSocialAction.Import && data) {
      // if user logged in - do not show dialog, just redirect to subscriptions page
      dispatch(
        fetchSubscriptionsRedisCloud(null, true, () => {
          history.push(Pages.redisCloudSubscriptions)
        }),
      )

      sendEventTelemetry({
        event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
        eventData: { source },
      })

      return
    }

    if (action) {
      sendEventTelemetry({
        event: telemetryEventByAction[action],
        eventData: { source: telemetrySource || source },
      })
    }

    dispatch(setSSOFlow(action))
    dispatch(setSocialDialogState(source))
  }

  return children?.(ssoCloudHandlerClick, !!feature?.flag)
}

export default OAuthSsoHandlerDialog
