import React from 'react'

import { RiColorText } from 'uiBase/text'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiSecondaryButton } from 'uiBase/forms'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text }: Props) => (
  <RiColorText color="danger">{text}</RiColorText>
)

export default DefaultErrorContent
