import React from 'react'

import { useSelector } from 'react-redux'

import {
  CloudSsoUtmCampaign,
  OAuthSocialAction,
  OAuthSocialSource,
} from 'uiSrc/slices/interfaces'
import {
  FeatureFlagComponent,
  OAuthConnectFreeDb,
  OAuthSsoHandlerDialog,
} from 'uiSrc/components'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { FeatureFlags } from 'uiSrc/constants'
import { RiText, RiTitle } from 'uiSrc/components/base/text'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { RiLink } from 'uiSrc/components/base/display'
import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

const utm = {
  medium: 'main',
  campaign: UTM_CAMPAINGS[CloudSsoUtmCampaign.BrowserFilter],
}

const FilterNotAvailable = ({ onClose }: { onClose?: () => void }) => {
  const freeInstances = useSelector(freeInstancesSelector) || []
  const onFreeDatabaseClick = () => {
    onClose?.()
  }
  return (
    <div className={styles.container}>
      <RiIcon type="RedisDbBlueIcon" size="original" />
      <RiTitle
        size="M"
        className={styles.title}
        data-testid="filter-not-available-title"
      >
        Upgrade your Redis database to version 6 or above
      </RiTitle>
      <RiText>Filtering by data type is supported in Redis 6 and above.</RiText>
      <RiSpacer size="m" />
      {!!freeInstances.length && (
        <>
          <RiText color="subdued">
            Use your free trial all-in-one Redis Cloud database to start
            exploring these capabilities.
          </RiText>
          <RiSpacer />
          <OAuthConnectFreeDb
            id={freeInstances[0].id}
            source={OAuthSocialSource.BrowserFiltering}
            onSuccessClick={onClose}
          />
        </>
      )}
      {!freeInstances.length && (
        <FeatureFlagComponent name={FeatureFlags.cloudAds}>
          <RiText color="subdued">
            Create a free trial Redis Stack database that supports filtering and
            extends the core capabilities of your Redis.
          </RiText>
          <RiSpacer size="l" />
          <div className={styles.linksWrapper}>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <RiPrimaryButton
                  onClick={(e) => {
                    ssoCloudHandlerClick(e, {
                      source: OAuthSocialSource.BrowserFiltering,
                      action: OAuthSocialAction.Create,
                    })
                    onFreeDatabaseClick()
                  }}
                  data-testid="get-started-link"
                  size="s"
                >
                  Get Started For Free
                </RiPrimaryButton>
              )}
            </OAuthSsoHandlerDialog>
            <RiSpacer size="m" />
            <RiLink
              className={styles.link}
              target="_blank"
              color="text"
              href={getUtmExternalLink(EXTERNAL_LINKS.redisStack, utm)}
              data-testid="learn-more-link"
            >
              Learn More
            </RiLink>
          </div>
        </FeatureFlagComponent>
      )}
    </div>
  )
}

export default FilterNotAvailable
