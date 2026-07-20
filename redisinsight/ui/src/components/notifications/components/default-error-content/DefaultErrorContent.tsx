import React from 'react'

import * as S from './DefaultErrorContent.styles'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text }: Props) => (
  <S.ErrorText color="danger">{text}</S.ErrorText>
)

export default DefaultErrorContent
