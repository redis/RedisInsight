import React from 'react'
import cx from 'classnames'
import { APPLICATION_NAME } from 'uiSrc/constants'
import { RiText } from 'uiSrc/components/base/text'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { ExternalLink } from 'uiSrc/components'
import styles from '../styles.module.scss'

const MessageCloudApiKeys = () => (
  <RiText
    color="subdued"
    size="s"
    className={styles.message}
    data-testid="summary"
  >
    {
      'Enter Redis Cloud API keys to discover and add databases. API keys can be enabled by following the steps mentioned in the '
    }

    <ExternalLink
      className={cx(styles.link, styles.external)}
      href="https://docs.redis.com/latest/rc/api/get-started/enable-the-api/"
    >
      documentation.
    </ExternalLink>
  </RiText>
)

const MessageStandalone = () => (
  <RiText
    color="subdued"
    size="s"
    className={styles.message}
    data-testid="summary"
  >
    You can manually add your Redis databases. Enter host and port of your Redis
    database to add it to {APPLICATION_NAME}. &nbsp;
    <ExternalLink
      className={cx(styles.link, styles.external)}
      href={getUtmExternalLink(
        'https://redis.io/docs/latest/develop/connect/insight#connection-management',
        { campaign: 'redisinsight' },
      )}
    >
      Learn more here.
    </ExternalLink>
  </RiText>
)

const MessageSentinel = () => (
  <RiText
    color="subdued"
    size="s"
    className={styles.message}
    data-testid="summary"
  >
    You can automatically discover and add primary groups from your Redis
    Sentinel. Enter host and port of your Redis Sentinel to automatically
    discover your primary groups and add them to {APPLICATION_NAME}. &nbsp;
    <ExternalLink
      className={cx(styles.link, styles.external)}
      href={getUtmExternalLink(
        'https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/',
        { campaign: 'redisinsight' },
      )}
    >
      Learn more here.
    </ExternalLink>
  </RiText>
)

const MessageEnterpriceSoftware = () => (
  <RiText
    color="subdued"
    size="s"
    className={styles.message}
    data-testid="summary"
  >
    Your Redis Software databases can be automatically added. Enter the
    connection details of your Redis Software Cluster to automatically discover
    your databases and add them to {APPLICATION_NAME}. &nbsp;
    <ExternalLink
      className={cx(styles.link, styles.external)}
      href={getUtmExternalLink(
        'https://redis.io/redis-enterprise-software/overview/',
        { campaign: 'redisinsight' },
      )}
    >
      Learn more here.
    </ExternalLink>
  </RiText>
)

export {
  MessageStandalone,
  MessageSentinel,
  MessageCloudApiKeys,
  MessageEnterpriceSoftware,
}
