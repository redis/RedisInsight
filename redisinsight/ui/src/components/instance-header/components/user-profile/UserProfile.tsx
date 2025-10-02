import React from 'react'
import { useSelector } from 'react-redux'
import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthUserProfile } from 'uiSrc/components'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { CloudUserProfile } from './CloudUserProfile'

const UserProfile = () => {
  const {
    [FeatureFlags.envDependent]: envDependentFeature,
    [FeatureFlags.cloudAds]: cloudAds,
    [FeatureFlags.cloudSso]: cloudSso,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  return (
    <FlexItem style={{ marginLeft: 16 }}>
      <CloudUserProfile />
    </FlexItem>
  )
  if (!envDependentFeature?.flag) {
    return (
      <FlexItem style={{ marginLeft: 16 }}>
        <CloudUserProfile />
      </FlexItem>
    )
  }

  if (cloudAds?.flag && cloudSso?.flag) {
    return (
      <FlexItem style={{ marginLeft: 16 }}>
        <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
      </FlexItem>
    )
  }

  return null
}

export default UserProfile
