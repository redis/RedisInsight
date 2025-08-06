import React from 'react'
import { useSelector } from 'react-redux'
import { RiFlexItem } from 'uiBase/layout'
import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthUserProfile } from 'uiSrc/components'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { CloudUserProfile } from './CloudUserProfile'

const UserProfile = () => {
  const {
    [FeatureFlags.envDependent]: envDependentFeature,
    [FeatureFlags.cloudAds]: cloudAds,
    [FeatureFlags.cloudSso]: cloudSso,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  if (!envDependentFeature?.flag) {
    return (
      <RiFlexItem style={{ marginLeft: 16 }}>
        <CloudUserProfile />
      </RiFlexItem>
    )
  }

  if (cloudAds?.flag && cloudSso?.flag) {
    return (
      <RiFlexItem style={{ marginLeft: 16 }}>
        <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
      </RiFlexItem>
    )
  }

  return null
}

export default UserProfile
