import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { cloudUserProfileSelector } from 'uiSrc/slices/user/cloud-user-profile'
import UserProfileBadge from 'uiSrc/components/instance-header/components/user-profile/UserProfileBadge'

export const CloudUserProfile = () => {
  const { data, error } = useAppSelector(cloudUserProfileSelector)
  if (!data?.name) {
    return null
  }

  return (
    <UserProfileBadge
      error={error}
      data={data}
      data-testid="cloud-user-profile-badge"
    />
  )
}
