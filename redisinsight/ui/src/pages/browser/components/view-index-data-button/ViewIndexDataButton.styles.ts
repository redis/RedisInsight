import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText } from 'uiSrc/components/base/text'

export const CountBadge = styled(Col)`
  min-width: ${({ theme }) => theme.core.space.space250};
  height: ${({ theme }) => theme.core.space.space250};
  padding: ${({ theme }) =>
    `${theme.core.space.space010} ${theme.core.space.space050}`};
  border-radius: ${({ theme }) => theme.core.space.space800};
  overflow: clip;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.secondary200};
  line-height: normal;
  white-space: nowrap;
`

export const CountBadgeText = styled(ColorText)`
  line-height: normal;
  white-space: nowrap;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' on;
`

export const TriggerRow = styled(Row)`
  cursor: pointer;
`
