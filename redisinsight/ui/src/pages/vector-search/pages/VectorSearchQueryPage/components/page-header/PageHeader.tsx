import React from 'react'

import { HeaderTitle } from '../header-title'
import { ViewIndexButton } from '../view-index-button'

import { PageHeaderProps } from './PageHeader.types'
import * as S from './PageHeader.styles'

export const PageHeader = ({
  indexName,
  indexOptions,
  isIndexPanelOpen,
  onIndexChange,
  onToggleIndexPanel,
}: PageHeaderProps) => (
  <S.HeaderRow>
    <HeaderTitle
      indexName={indexName}
      indexOptions={indexOptions}
      onIndexChange={onIndexChange}
    />
    <ViewIndexButton isActive={isIndexPanelOpen} onClick={onToggleIndexPanel} />
  </S.HeaderRow>
)
