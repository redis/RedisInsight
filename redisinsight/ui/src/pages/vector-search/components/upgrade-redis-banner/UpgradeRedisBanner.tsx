import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  OAuthSocialAction,
  OAuthSocialSource,
} from 'uiSrc/slices/interfaces/cloud'
import { useTranslation } from 'uiSrc/i18n'

export const UpgradeRedisBanner = () => {
  const { t } = useTranslation()
  const {
    [FeatureFlags.cloudSso]: featureFlagCloudSsl,
    [FeatureFlags.cloudAds]: featureFlagCloudAds,
  } = useAppSelector(appFeatureFlagsFeaturesSelector)

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
                label: t('vectorSearch.upgradeBanner.cta'),
                onClick: () =>
                  // @ts-ignore: We don't have the event arg here
                  ssoCloudHandlerClick(null, {
                    source: OAuthSocialSource.BrowserFiltering,
                    action: OAuthSocialAction.Create,
                  }),
              },
            },
          })}
          data-testid="upgrade-redis-banner"
        >
          {t('vectorSearch.upgradeBanner.message')}
        </CallOut>
      )}
    </OAuthSsoHandlerDialog>
  )
}
