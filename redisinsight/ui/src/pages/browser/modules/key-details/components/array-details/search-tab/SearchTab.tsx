import React from 'react'

import { Text } from 'uiSrc/components/base/text'

import * as S from '../tabs.styles'

const SearchTab = () => (
  <S.TabPlaceholder data-testid="array-search-placeholder">
    <Text>This is Search</Text>
  </S.TabPlaceholder>
)

export default SearchTab
