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

import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'
import { ProgressBarLoader } from 'uiSrc/components/base/display'
import {
  ExplorePanelWrapper,
  PageDefaultHeader,
  PageWrapper,
} from './HomePageTemplate.styles'
import { instancesSelector as databaseInstancesSelector } from 'uiSrc/slices/instances/instances'
import { instancesSelector as rdiInstancesSelector } from 'uiSrc/slices/rdi/instances'

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

  const { loading: instancesLoading } = useSelector(databaseInstancesSelector)
  const { loading: rdiLoading } = useSelector(rdiInstancesSelector)

  const loading = instancesLoading || rdiLoading

  return (
    <>
      {loading && (
        <ProgressBarLoader
          color="primary"
          data-testid="progress-key-stream"
          absolute
        />
      )}
      <PageDefaultHeader align="center" justify="between" gap="l">
        <HomeTabs />
        <FlexGroup align="center" justify="end" gap="l">
          {isAnyChatAvailable && (
            <FlexItem>
              <CopilotTrigger />
            </FlexItem>
          )}
          <FlexItem>
            <InsightsTrigger source="home page" />
          </FlexItem>
          <FeatureFlagComponent
            name={[FeatureFlags.cloudSso, FeatureFlags.cloudAds]}
          >
            <FlexItem data-testid="home-page-sso-profile">
              <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
            </FlexItem>
          </FeatureFlagComponent>
        </FlexGroup>
      </PageDefaultHeader>
      <PageWrapper>
        <ExplorePanelWrapper>
          <ExplorePanelTemplate>{children}</ExplorePanelTemplate>
        </ExplorePanelWrapper>
      </PageWrapper>
    </>
  )
}

export default React.memo(HomePageTemplate)
