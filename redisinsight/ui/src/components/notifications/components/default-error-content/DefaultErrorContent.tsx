import React from 'react'

import { RiColorText } from 'uiBase/text'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text }: Props) => (
  <RiColorText color="danger">{text}</RiColorText>
)

export default DefaultErrorContent
