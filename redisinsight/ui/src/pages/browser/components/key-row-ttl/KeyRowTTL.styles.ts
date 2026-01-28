import styled, { css } from 'styled-components'
import { ColorText, Text } from 'uiSrc/components/base/text'

const keyTTLStyles = css`
  width: 86px;
  min-width: 86px;
  text-align: right;
`

export const KeyInfoLoading = styled.div`
  margin-top: ${({ theme }) => theme.core.space.space100};
  padding-left: ${({ theme }) => theme.core.space.space200};
  ${keyTTLStyles}
`

export const KeyTTLText = styled(Text)`
  ${keyTTLStyles}
`

export const KeyTTLColorText = styled(ColorText)`
  ${keyTTLStyles}
`
