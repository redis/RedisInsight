import React from 'react'
import {
  AlertStatusDot,
  AlertStatusList,
  AlertStatusListItem,
} from '../redis-cloud-subscriptions/RedisCloudSubscriptions/RedisCloudSubscriptions.styles'

export const AlertStatusContent = () => (
  <AlertStatusList gap="none" flush>
    <AlertStatusListItem
      size="s"
      label="Subscription status is not Active"
      icon={<AlertStatusDot />}
    />
    <AlertStatusListItem
      size="s"
      wrapText
      label="Subscription does not have any databases"
      icon={<AlertStatusDot />}
    />
    <AlertStatusListItem
      size="s"
      label="Error fetching subscription details"
      icon={<AlertStatusDot />}
    />
  </AlertStatusList>
)
