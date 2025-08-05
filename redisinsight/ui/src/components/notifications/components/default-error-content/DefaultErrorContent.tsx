import React from 'react'

import { RiColorText } from 'uiSrc/components/base/text'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiSecondaryButton } from 'uiSrc/components/base/forms'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text }: Props) => (
  <RiColorText color="danger">{text}</RiColorText>
)

export default DefaultErrorContent
