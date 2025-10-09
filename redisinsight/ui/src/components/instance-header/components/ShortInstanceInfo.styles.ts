import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const DbIndexInfoWrapper = styled(Row)`
  background: var(
    --tooltipLightBgColor
  ); // TODO: use theme color when designs are available
  border-radius: 8px;
  padding: 8px 16px;
`

export const SeparatorLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(
    --euiToastSuccessBorderColor
  ); // TODO: use theme color when designs are available
`

export const WordBreakWrapper = styled.div`
  word-break: break-word;
`
