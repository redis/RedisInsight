import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiText } from 'uiBase/text'
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
    <RiRow className={styles.container} align="center">
      <RiFlexItem style={{ overflow: 'hidden' }} grow>
        <div
          className={styles.breadcrumbsContainer}
          data-testid="breadcrumbs-container"
        >
          <div>
            <RiTooltip position="bottom" content="My RDI instances">
              <RiText
                className={styles.breadCrumbLink}
                aria-label="My RDI instances"
                data-testid="my-rdi-instances-btn"
                onClick={goHome}
                onKeyDown={goHome}
              >
                RDI instances
              </RiText>
            </RiTooltip>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ maxWidth: '100%' }}>
              <RiRow align="center">
                <RiFlexItem>
                  <RiText className={styles.divider}>&#62;</RiText>
                </RiFlexItem>
                <RiFlexItem grow style={{ overflow: 'hidden' }}>
                  <InstancesNavigationPopover name={name} />
                </RiFlexItem>
              </RiRow>
            </div>
          </div>
        </div>
      </RiFlexItem>

      {isAnyChatAvailable && (
        <RiFlexItem style={{ marginRight: 12 }}>
          <CopilotTrigger />
        </RiFlexItem>
      )}
      <RiFlexItem style={{ marginLeft: 12 }}>
        <InsightsTrigger />
      </RiFlexItem>

      <FeatureFlagComponent
        name={[FeatureFlags.cloudSso, FeatureFlags.cloudAds]}
      >
        <RiFlexItem
          style={{ marginLeft: 16 }}
          data-testid="o-auth-user-profile-rdi"
        >
          <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
        </RiFlexItem>
      </FeatureFlagComponent>
    </RiRow>
  )
}

export default RdiInstanceHeader
