import React from 'react'
import { useSelector } from 'react-redux'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { VectorSetElementList } from './vector-set-element-list'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'
import * as S from './VectorSetDetails.styles'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const VectorSetDetails = (props: Props) => {
  const keyType = KeyTypes.VectorSet
  const { loading } = useSelector(selectedKeySelector)

  return (
    <S.Container>
      <KeyDetailsHeader {...props} key="key-details-header" />
      <KeyDetailsSubheader keyType={keyType} />
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
