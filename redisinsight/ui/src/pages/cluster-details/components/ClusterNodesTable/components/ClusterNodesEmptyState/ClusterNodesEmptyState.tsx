import React from 'react'

import { LoadingContent } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text'

import * as S from './ClusterNodesEmptyState.styles'

interface ClusterNodesEmptyStateProps {
  loading: boolean
}

export const ClusterNodesEmptyState = ({
  loading,
}: ClusterNodesEmptyStateProps) => {
  if (loading) {
    return (
      <S.EmptyStateWrapper data-testid="primary-nodes-table-loading">
        <LoadingContent lines={4} />
      </S.EmptyStateWrapper>
    )
  }

  return (
    <S.EmptyStateContent data-testid="primary-nodes-table-empty">
      <Text>
        Primary node details are not available for this cluster configuration.
      </Text>
    </S.EmptyStateContent>
  )
}
