import React from 'react'

import { ColorText } from 'uiSrc/components/base/text'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text }: Props) => (
  <ColorText color="danger">{text}</ColorText>
)

export default DefaultErrorContent
