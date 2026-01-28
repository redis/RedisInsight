import styled, { css } from 'styled-components'
import { Text } from 'uiSrc/components/base/text'

const keySizeStyles = css`
  width: 90px;
  min-width: 90px;
  text-align: right;
`

export const KeyInfoLoading = styled.div`
  margin-top: ${({ theme }) => theme.core.space.space100};
  padding-left: ${({ theme }) => theme.core.space.space200};
  ${keySizeStyles}
`

export const KeySizeText = styled(Text)`
  ${keySizeStyles}
`
