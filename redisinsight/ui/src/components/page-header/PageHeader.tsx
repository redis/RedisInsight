import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import cx from 'classnames'
import { Pages, FeatureFlags } from 'uiSrc/constants'
import { resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { resetDataSentinel } from 'uiSrc/slices/instances/sentinel'

import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text/Title'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { RedisLogoFullIcon } from 'uiSrc/components/base/icons'
import styles from './PageHeader.module.scss'

interface Props {
  title?: string
  subtitle?: string
  children?: React.ReactNode
  showInsights?: boolean
  className?: string
}

const PageHeader = (props: Props) => {
  const { title, subtitle, showInsights, children, className } = props

  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([
    databaseChatFeature,
    documentationChatFeature,
  ])

  const history = useHistory()
  const dispatch = useDispatch()

  const resetConnections = () => {
    dispatch(resetDataRedisCluster())
    dispatch(resetDataRedisCloud())
    dispatch(resetDataSentinel())
  }

  const goHome = () => {
    resetConnections()
    history.push(Pages.home)
  }

  return (
    <div className={cx(styles.pageHeader, className)}>
      <div className={styles.pageHeaderTop}>
        <div>
          {title && (
            <Title size="L" data-testid="page-title">
              <b data-testid="page-header-title">{title}</b>
            </Title>
          )}
          {subtitle ? <span data-testid="page-subtitle">{subtitle}</span> : ''}
        </div>
        {children ? <>{children}</> : ''}
        {showInsights ? (
          <Row style={{ flexGrow: 0 }} align="center">
            {isAnyChatAvailable && (
              <FlexItem style={{ marginRight: 12 }}>
                <CopilotTrigger />
              </FlexItem>
            )}
            <FlexItem grow>
              <InsightsTrigger source="home page" />
            </FlexItem>
            <FeatureFlagComponent
              name={[FeatureFlags.cloudSso, FeatureFlags.cloudAds]}
            >
              <FlexItem
                grow
                style={{ marginLeft: 16 }}
                data-testid="o-auth-user-profile"
              >
                <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
              </FlexItem>
            </FeatureFlagComponent>
          </Row>
        ) : (
          <div className={styles.pageHeaderLogo}>
            <EmptyButton
              aria-label="redisinsight"
              onClick={goHome}
              onKeyDown={goHome}
              className={styles.logo}
              tabIndex={0}
              icon={RedisLogoFullIcon}
              data-testid="redis-logo-home"
            />
          </div>
        )}
      </div>
    </div>
  )
}

PageHeader.defaultProps = {
  subtitle: null,
  children: null,
}

export default PageHeader
