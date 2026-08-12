import React from 'react'
import { Trans } from 'uiSrc/i18n'
import { FeatureFlagComponent } from 'uiSrc/components'
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'

import { CloudLink } from 'uiSrc/components/markdown'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { FeatureFlags } from './featureFlags'
import { Row } from 'uiSrc/components/base/layout/flex'

export default {
  REJSON_SHOULD_BE_LOADED: (
    <>
      <Trans
        i18nKey="browser.addKey.jsonNotSupported"
        components={{
          docsLink: (
            <a
              href="https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/json/"
              target="_blank"
              rel="noreferrer"
            />
          ),
        }}
      />{' '}
      <FeatureFlagComponent name={FeatureFlags.cloudAds}>
        <Trans
          i18nKey="browser.addKey.jsonCloudAd"
          components={{
            cloudLink: (
              <CloudLink
                url={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                  source: UTM_MEDIUMS.App,
                  campaign: UTM_CAMPAINGS.RedisJson,
                })}
                source={OAuthSocialSource.BrowserRedisJSON}
              />
            ),
          }}
        />
      </FeatureFlagComponent>
    </>
  ),
  REMOVE_LAST_ELEMENT: () => (
    <Row align="center">
      <RiIcon size="s" type="ToastDangerIcon" style={{ marginRight: '1rem' }} />
      <Text size="s">
        <Trans i18nKey="browser.keyDetails.removeLastElement" />
      </Text>
    </Row>
  ),
  REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT: (
    <Trans
      i18nKey="browser.list.remove.multipleNotSupported"
      components={{
        link: (
          <a
            href={`${EXTERNAL_LINKS.tryFree}?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redis_latest`}
            target="_blank"
            className="link-underline"
            rel="noreferrer"
          >
            free up-to-date
          </a>
        ),
      }}
    />
  ),
}
