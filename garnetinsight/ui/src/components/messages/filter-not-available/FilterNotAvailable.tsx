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
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
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
      <Title
        size="M"
        className={styles.title}
        data-testid="filter-not-available-title"
      >
        Upgrade your Redis database to version 6 or above
      </Title>
      <Text>Filtering by data type is supported in Redis 6 and above.</Text>
      <Spacer size="m" />
      {!!freeInstances.length && (
        <>
          <Text color="subdued">
            Use your free all-in-one Redis Cloud database to start
            exploring these capabilities.
          </Text>
          <Spacer />
          <OAuthConnectFreeDb
            id={freeInstances[0].id}
            source={OAuthSocialSource.BrowserFiltering}
            onSuccessClick={onClose}
          />
        </>
      )}
      {!freeInstances.length && (
        <FeatureFlagComponent name={FeatureFlags.cloudAds}>
          <Text color="subdued">
            Create a free Redis Cloud database that supports filtering and
            extends the core capabilities of your Redis.
          </Text>
          <Spacer size="l" />
          <div className={styles.linksWrapper}>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <PrimaryButton
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
                </PrimaryButton>
              )}
            </OAuthSsoHandlerDialog>
            <Spacer size="m" />
            <Link
              className={styles.link}
              target="_blank"
              color="text"
              href={getUtmExternalLink(EXTERNAL_LINKS.redisStack, utm)}
              data-testid="learn-more-link"
            >
              Learn More
            </Link>
          </div>
        </FeatureFlagComponent>
      )}
    </div>
  )
}

export default FilterNotAvailable
