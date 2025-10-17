import React from 'react'
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
      This database does not support the JSON data structure. Learn more about
      JSON support{' '}
      <a
        href="https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/json/"
        target="_blank"
        rel="noreferrer"
      >
        here
      </a>
      .{' '}
      <FeatureFlagComponent name={FeatureFlags.cloudAds}>
        <>
          You can also create a{' '}
          <CloudLink
            text="free Redis Cloud database"
            url={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
              source: UTM_MEDIUMS.App,
              campaign: UTM_CAMPAINGS.RedisJson,
            })}
            source={OAuthSocialSource.BrowserRedisJSON}
          />{' '}
          with built-in JSON support.
        </>
      </FeatureFlagComponent>
    </>
  ),
  REMOVE_LAST_ELEMENT: () => (
    <Row align="center">
      <RiIcon size="s" type="ToastDangerIcon" style={{ marginRight: '1rem' }} />
      <Text size="s">Removing the last item deletes the entire key.</Text>
    </Row>
  ),
  REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT: (
    <>
      Removing multiple elements is available for Redis databases v. 6.2 or
      later. Update your Redis database or create a new&nbsp;
      <a
        href={`${EXTERNAL_LINKS.tryFree}?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redis_latest`}
        target="_blank"
        className="link-underline"
        rel="noreferrer"
      >
        free up-to-date trial
      </a>
      &nbsp;Redis database.
    </>
  ),
}
