import React from 'react'

import { LoadingContent } from 'uiSrc/components'

import * as S from './ClusterNodesEmptyState.styles'

export const ClusterNodesEmptyState = () => (
  <S.EmptyStateWrapper data-testid="primary-nodes-table-loading">
    <LoadingContent lines={4} />
  </S.EmptyStateWrapper>
)
