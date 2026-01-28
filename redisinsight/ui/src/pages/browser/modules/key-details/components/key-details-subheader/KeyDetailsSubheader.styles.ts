import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import Divider from 'uiSrc/components/divider/Divider'

export const SubheaderContainer = styled(FlexItem)`
  padding: 12px 18px 0px 18px;
`

export const StyledDivider = styled(Divider)`
  margin: 0 14px;
  height: 20px;
  width: 1px;
`

export const KeyFormatterItem = styled(FlexItem)``

export const ActionItem = styled(FlexItem)`
  margin-left: ${({ theme }) => theme.core.space.space150};
`
