import React from 'react'
import { Text } from 'uiSrc/components/base/text'

export interface Props {
  children: React.ReactElement | string
  style?: any
}
const PlainText = ({ children, ...rest }: Props) => (
  <Text
    style={{ whiteSpace: 'nowrap', width: 'auto', ...rest.style }}
    color="subdued"
    size="m"
  >
    {children}
  </Text>
)

export default PlainText
