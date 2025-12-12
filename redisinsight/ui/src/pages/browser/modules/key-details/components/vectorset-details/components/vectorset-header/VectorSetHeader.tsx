import React from 'react'
import { useSelector } from 'react-redux'

import { vectorsetInfoSelector } from 'uiSrc/slices/browser/vectorset'
import { Text } from 'uiSrc/components/base/text'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'

import type { VectorSetHeaderProps } from './VectorSetHeader.types'
import * as S from './VectorSetHeader.styles'

const VectorSetHeader = ({ 'data-testid': testId }: VectorSetHeaderProps) => {
  const info = useSelector(vectorsetInfoSelector)

  if (!info) return null

  return (
    <S.HeaderContainer gap="l" align="center" data-testid={testId}>
      <S.InfoItem>
        <Text size="s" color="secondary">
          Vector Dimension:
        </Text>
        <RiBadge>{info.vectorDim}</RiBadge>
      </S.InfoItem>
      <S.InfoItem>
        <Text size="s" color="secondary">
          Quantization:
        </Text>
        <RiBadge>{info.quantType}</RiBadge>
      </S.InfoItem>
      <S.InfoItem>
        <Text size="s" color="secondary">
          Elements:
        </Text>
        <RiBadge>{info.size}</RiBadge>
      </S.InfoItem>
      {info.maxLevel !== undefined && (
        <S.InfoItem>
          <Text size="s" color="secondary">
            Max Level:
          </Text>
          <RiBadge>{info.maxLevel}</RiBadge>
        </S.InfoItem>
      )}
    </S.HeaderContainer>
  )
}

export { VectorSetHeader }
