import React from 'react'

import { Text } from 'uiSrc/components/base/text'

import * as S from '../tabs.styles'

const AggregateTab = () => (
  <S.TabPlaceholder data-testid="array-aggregate-placeholder">
    <Text>This is Aggregate</Text>
  </S.TabPlaceholder>
)

export default AggregateTab
