import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Row } from 'uiSrc/components/base/layout/flex'

import { HeaderTitle } from './header-title'
import { CreateIndexMenu } from './create-index-menu'

import * as S from '../VectorSearchListPage.styles'
import { ListHeaderProps } from './ListHeader.types'

export const ListHeader = ({ search, onSearchChange }: ListHeaderProps) => {
  const { t } = useTranslation()

  return (
    <S.HeaderRow justify="between" data-testid="vector-search--list--header">
      <HeaderTitle />
      <Row grow={false} align="center" gap="m">
        <S.IndexSearchInput
          placeholder={t('vectorSearch.list.search.placeholder')}
          value={search}
          onChange={onSearchChange}
          data-testid="vector-search--list--search"
        />
        <CreateIndexMenu />
      </Row>
    </S.HeaderRow>
  )
}
