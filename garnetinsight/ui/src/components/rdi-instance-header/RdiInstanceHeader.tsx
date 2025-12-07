import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'
import {
  FeatureFlagComponent,
  OAuthUserProfile,
  RiTooltip,
} from 'uiSrc/components'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import InstancesNavigationPopover from '../instance-header/components/instances-navigation-popover'
import styles from './styles.module.scss'

const RdiInstanceHeader = () => {
  const { name = '' } = useSelector(connectedInstanceSelector)
  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([
    databaseChatFeature,
    documentationChatFeature,
  ])
  const history = useHistory()

  const goHome = () => {
    history.push(Pages.rdi)
  }

  return (
    <Row className={styles.container} align="center">
      <FlexItem style={{ overflow: 'hidden' }} grow>
        <div
          className={styles.breadcrumbsContainer}
          data-testid="breadcrumbs-container"
        >
          <div>
            <RiTooltip position="bottom" content="My RDI instances">
              <Link
                color="subdued"
                underline
                variant="inline"
                aria-label="My RDI instances"
                data-testid="my-rdi-instances-btn"
                onClick={goHome}
              >
                Data integration
              </Link>
            </RiTooltip>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ maxWidth: '100%' }}>
              <Row align="center">
                <FlexItem>
                  <Text className={styles.divider}>/</Text>
                </FlexItem>
                <FlexItem grow style={{ overflow: 'hidden' }}>
                  <InstancesNavigationPopover name={name} />
                </FlexItem>
              </Row>
            </div>
          </div>
        </div>
      </FlexItem>

      {isAnyChatAvailable && (
        <FlexItem style={{ marginRight: 12 }}>
          <CopilotTrigger />
        </FlexItem>
      )}
      <FlexItem style={{ marginLeft: 12 }}>
        <InsightsTrigger />
      </FlexItem>

      <FeatureFlagComponent
        name={[FeatureFlags.cloudSso, FeatureFlags.cloudAds]}
      >
        <FlexItem
          style={{ marginLeft: 16 }}
          data-testid="o-auth-user-profile-rdi"
        >
          <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
        </FlexItem>
      </FeatureFlagComponent>
    </Row>
  )
}

export default RdiInstanceHeader
