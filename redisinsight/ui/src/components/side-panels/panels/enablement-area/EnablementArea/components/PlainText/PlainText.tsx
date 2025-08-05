import React from 'react'
import { RiText } from 'uiSrc/components/base/text'

export interface Props {
  children: React.ReactElement | string
  style?: any
}
const PlainText = ({ children, ...rest }: Props) => (
  <RiText
    style={{ whiteSpace: 'nowrap', width: 'auto', ...rest.style }}
    color="subdued"
    size="m"
  >
    {children}
  </RiText>
)

export default PlainText
