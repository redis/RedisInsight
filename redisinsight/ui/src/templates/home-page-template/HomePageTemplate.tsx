import React from 'react'
import { useSelector } from 'react-redux'

import { ExplorePanelTemplate } from 'uiSrc/templates'
import HomeTabs from 'uiSrc/components/home-tabs'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'
import { FeatureFlags } from 'uiSrc/constants'
import { FeatureFlagComponent, OAuthUserProfile } from 'uiSrc/components'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'

import { RiFlexGroup as Flex, RiFlexItem } from 'uiSrc/components/base/layout'
import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const HomePageTemplate = (props: Props) => {
  const { children } = props

  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([
    databaseChatFeature,
    documentationChatFeature,
  ])

  return (
    <>
      <div className={styles.pageDefaultHeader}>
        <HomeTabs />
        <Flex style={{ flexGrow: 0 }} gap="none" align="center">
          {isAnyChatAvailable && (
            <RiFlexItem style={{ marginRight: 12 }}>
              <CopilotTrigger />
            </RiFlexItem>
          )}
          <RiFlexItem grow>
            <InsightsTrigger source="home page" />
          </RiFlexItem>
          <FeatureFlagComponent
            name={[FeatureFlags.cloudSso, FeatureFlags.cloudAds]}
          >
            <RiFlexItem
              grow
              style={{ marginLeft: 16 }}
              data-testid="home-page-sso-profile"
            >
              <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
            </RiFlexItem>
          </FeatureFlagComponent>
        </Flex>
      </div>
      <div className={styles.pageWrapper}>
        <ExplorePanelTemplate panelClassName={styles.explorePanel}>
          {children}
        </ExplorePanelTemplate>
      </div>
    </>
  )
}

export default React.memo(HomePageTemplate)
