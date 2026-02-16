import React from 'react'

import { useRedisInstanceCompatibility } from '../../hooks'
import { UpgradeRedisBanner } from '../../components/upgrade-redis-banner'
import { ListHeader } from './components/ListHeader'
import { ListContent } from './components/list-content'
import * as S from './VectorSearchListPage.styles'

/**
 * Vector Search List Page.
 * Displays the list of search indexes with a header (title, info popover,
 * create-index dropdown) and a table of index data.
 * Shows an upgrade banner when the Redis version is below the minimum supported.
 */
export const VectorSearchListPage = () => {
  const { hasSupportedVersion } = useRedisInstanceCompatibility()

  return (
    <S.PageWrapper gap="l" data-testid="vector-search--list--page">
      {hasSupportedVersion === false && <UpgradeRedisBanner />}

      <ListHeader />
      <ListContent />
    </S.PageWrapper>
  )
}
