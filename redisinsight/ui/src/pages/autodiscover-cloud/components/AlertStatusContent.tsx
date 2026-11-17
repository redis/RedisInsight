import React from 'react'
import {
  AlertStatusDot,
  AlertStatusList,
  AlertStatusListItem,
} from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/RedisCloudSubscriptions/RedisCloudSubscriptions.styles'
import { useTranslation } from 'uiSrc/i18n'

export const AlertStatusContent = () => {
  const { t } = useTranslation()

  return (
    <AlertStatusList gap="none" flush>
      <AlertStatusListItem
        size="s"
        label={t('autodiscover.cloud.alert.statusNotActive')}
        icon={<AlertStatusDot />}
      />
      <AlertStatusListItem
        size="s"
        wrapText
        label={t('autodiscover.cloud.alert.noDatabases')}
        icon={<AlertStatusDot />}
      />
      <AlertStatusListItem
        size="s"
        label={t('autodiscover.cloud.alert.errorFetching')}
        icon={<AlertStatusDot />}
      />
    </AlertStatusList>
  )
}
