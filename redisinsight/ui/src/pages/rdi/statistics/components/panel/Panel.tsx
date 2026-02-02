import React from 'react'

import * as S from './Panel.styles'

interface Props {
  children: string | JSX.Element
}

const Panel = ({ children }: Props) => (
  <S.PanelWrapper>{children}</S.PanelWrapper>
)

export default Panel
