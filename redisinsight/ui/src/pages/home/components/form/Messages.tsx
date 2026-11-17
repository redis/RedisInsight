import React from 'react'
import { APPLICATION_NAME } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Link } from 'uiSrc/components/base/link/Link'
import { Trans } from 'uiSrc/i18n'

const MessageCloudApiKeys = () => (
  <Text data-testid="summary" color="primary">
    <Trans
      i18nKey="home.form.message.cloudApiKeys"
      components={{
        link: (
          <Link
            external
            variant="inline"
            color="subdued"
            href="https://docs.redis.com/latest/rc/api/get-started/enable-the-api/"
          />
        ),
      }}
    />
  </Text>
)

const MessageSentinel = () => (
  <Text data-testid="summary" color="primary">
    <Trans
      i18nKey="home.form.message.sentinel"
      values={{ appName: APPLICATION_NAME }}
      components={{
        link: (
          <Link
            external
            variant="inline"
            color="subdued"
            href={getUtmExternalLink(
              'https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/',
              { campaign: 'redisinsight' },
            )}
          />
        ),
      }}
    />
  </Text>
)

const MessageEnterpriceSoftware = () => (
  <Text data-testid="summary" color="primary">
    <Trans
      i18nKey="home.form.message.enterpriseSoftware"
      values={{ appName: APPLICATION_NAME }}
      components={{
        link: (
          <Link
            external
            variant="inline"
            color="subdued"
            href={getUtmExternalLink(
              'https://redis.io/redis-enterprise-software/overview/',
              { campaign: 'redisinsight' },
            )}
          />
        ),
      }}
    />
  </Text>
)

export { MessageSentinel, MessageCloudApiKeys, MessageEnterpriceSoftware }
