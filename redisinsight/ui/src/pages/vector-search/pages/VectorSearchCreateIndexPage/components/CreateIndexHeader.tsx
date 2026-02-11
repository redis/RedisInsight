import React from 'react'

import { Title } from 'uiSrc/components/base/text'

import { useCreateIndexPage } from '../../../context/create-index-page'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexHeader = () => {
  const { displayName } = useCreateIndexPage()

  return (
    <S.TitleRow data-testid="vector-search--create-index--header">
      <Title size="S" data-testid="vector-search--create-index--title">
        View sample data index: {displayName}
      </Title>
    </S.TitleRow>
  )
}
