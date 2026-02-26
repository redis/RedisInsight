import React from 'react'

import { HeaderTitle } from './header-title'
import { CreateIndexMenu } from './create-index-menu'

import * as S from '../VectorSearchListPage.styles'

export const ListHeader = () => (
  <S.HeaderRow justify="between" data-testid="vector-search--list--header">
    <HeaderTitle />
    <CreateIndexMenu />
  </S.HeaderRow>
)
