import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { VectorSearchScreenBlockWrapper } from '../styles'
import { RightAlignedWrapper } from './styles'

type QueryCardProps = {
  label: string
  value: string
  onQueryInsert: (value: string) => void
}

export const QueryCard = ({ label, value, onQueryInsert }: QueryCardProps) => (
  <VectorSearchScreenBlockWrapper key={value} padding={6}>
    <Text>{label}</Text>
    <RightAlignedWrapper>
      <EmptyButton
        icon={PlayFilledIcon}
        onClick={() => onQueryInsert(value)}
        data-testid="btn-insert-query"
      >
        Insert
      </EmptyButton>
    </RightAlignedWrapper>
  </VectorSearchScreenBlockWrapper>
)
