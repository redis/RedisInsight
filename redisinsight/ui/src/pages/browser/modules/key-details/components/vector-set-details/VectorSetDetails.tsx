import React from 'react'
import { useSelector } from 'react-redux'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { VectorSetElementList } from './vector-set-element-list'
import { VectorSetKeySubheader } from './vector-set-key-subheader'
import * as S from './VectorSetDetails.styles'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const VectorSetDetails = (props: Props) => {
  const { loading } = useSelector(selectedKeySelector)

  return (
    <S.Container>
      <KeyDetailsHeader {...props} key="key-details-header" />
      <VectorSetKeySubheader />
      <S.DetailsBody>
        {!loading && (
          <S.ListWrapper>
            <VectorSetElementList />
          </S.ListWrapper>
        )}
      </S.DetailsBody>
    </S.Container>
  )
}

export { VectorSetDetails }
