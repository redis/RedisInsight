import React from 'react'
import * as S from './SuspenseLoader.styles'

const SuspenseLoader = () => (
  <S.Cover
    data-testid="suspense-loader"
    grow={false}
    justify="center"
    align="center"
  >
    <S.StyledLoader size="xl" />
  </S.Cover>
)

export default SuspenseLoader
