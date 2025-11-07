import React from 'react'
import { APPLICATION_NAME } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Link } from 'uiSrc/components/base/link/Link'

const MessageCloudApiKeys = () => (
  <Text data-testid="summary" color="primary">
    {
      'Enter Redis Cloud API keys to discover and add databases. API keys can be enabled by following the steps mentioned in the '
    }
    <Link
      external
      variant="inline"
      href="https://docs.redis.com/latest/rc/api/get-started/enable-the-api/"
    >
      documentation
    </Link>
    {'.'}
  </Text>
)

const MessageStandalone = () => (
  <Text data-testid="summary" color="primary">
    You can manually add your Redis databases. Enter host and port of your Redis
    database to add it to {APPLICATION_NAME}. &nbsp;
    <Link
      external
      variant="inline"
      href={getUtmExternalLink(
        'https://redis.io/docs/latest/develop/connect/insight#connection-management',
        { campaign: 'redisinsight' },
      )}
    >
      Learn more here.
    </Link>
  </Text>
)

const MessageSentinel = () => (
  <Text data-testid="summary" color="primary">
    You can automatically discover and add primary groups from your Redis
    Sentinel. Enter host and port of your Redis Sentinel to automatically
    discover your primary groups and add them to {APPLICATION_NAME}. &nbsp;
    <Link
      external
      variant="inline"
      href={getUtmExternalLink(
        'https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/',
        { campaign: 'redisinsight' },
      )}
    >
      Learn more here.
    </Link>
  </Text>
)

const MessageEnterpriceSoftware = () => (
  <Text data-testid="summary" color="primary">
    Your Redis Software databases can be automatically added. Enter the
    connection details of your Redis Software Cluster to automatically discover
    your databases and add them to {APPLICATION_NAME}. &nbsp;
    <Link
      external
      variant="inline"
      href={getUtmExternalLink(
        'https://redis.io/redis-enterprise-software/overview/',
        { campaign: 'redisinsight' },
      )}
    >
      Learn more here.
    </Link>
  </Text>
)

export {
  MessageStandalone,
  MessageSentinel,
  MessageCloudApiKeys,
  MessageEnterpriceSoftware,
}
