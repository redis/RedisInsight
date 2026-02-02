import React from 'react'
import * as S from '../../../../../SidePanels.styles'

const LoadingMessage = () => (
  <S.Loader>
    {/* eslint-disable-next-line react/no-array-index-key */}
    {Array.from({ length: 3 }).map((_, i) => (
      <S.Dot key={`dot_${i}`} />
    ))}
  </S.Loader>
)

export default LoadingMessage
