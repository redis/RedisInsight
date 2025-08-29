import React from 'react'
import { useSelector } from 'react-redux'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  OAuthSocialAction,
  OAuthSocialSource,
} from 'uiSrc/slices/interfaces/cloud'

export const VectorSetNotAvaiallableBanner = () => {
  const {
    [FeatureFlags.cloudSso]: featureFlagCloudSsl,
    [FeatureFlags.cloudAds]: featureFlagCloudAds,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const isCloudSsoEnabled =
    featureFlagCloudSsl?.flag && featureFlagCloudAds?.flag

  return (
    <OAuthSsoHandlerDialog>
      {(ssoCloudHandlerClick) => (
        <CallOut
          variant="notice"
          {...(isCloudSsoEnabled && {
            actions: {
              primary: {
                label: 'Free Redis Cloud DB',
                onClick: () =>
                  // @ts-ignore: We don't have the event arg here
                  ssoCloudHandlerClick(null, {
                    source: OAuthSocialSource.BrowserFiltering,
                    action: OAuthSocialAction.Create,
                  }),
              },
            },
          })}
          data-testid="vector-set-not-available-banner"
        >
          Upgrade to Redis 7.2+ to unlock fast, real-time semantic AI search
          with vector search
        </CallOut>
      )}
    </OAuthSsoHandlerDialog>
  )
}
