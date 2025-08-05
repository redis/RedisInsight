import React from 'react'

import { ColorText } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiSecondaryButton } from 'uiSrc/components/base/forms'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text }: Props) => (
  <ColorText color="danger">{text}</ColorText>
)

export default DefaultErrorContent
