import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { LoadingContent } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text'

import * as S from './ClusterNodesEmptyState.styles'

interface ClusterNodesEmptyStateProps {
  loading: boolean
}

export const ClusterNodesEmptyState = ({
  loading,
}: ClusterNodesEmptyStateProps) => {
  const { t } = useTranslation()

  if (loading) {
    return (
      <S.EmptyStateWrapper data-testid="primary-nodes-table-loading">
        <LoadingContent lines={4} />
      </S.EmptyStateWrapper>
    )
  }

  return (
    <S.EmptyStateContent data-testid="primary-nodes-table-empty">
      <Text>{t('analytics.clusterDetails.table.emptyState')}</Text>
    </S.EmptyStateContent>
  )
}
