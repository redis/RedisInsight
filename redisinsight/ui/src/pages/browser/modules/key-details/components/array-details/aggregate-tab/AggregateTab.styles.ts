import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const ResultPanel = styled(Col)`
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.core.space.space150};
  overflow: auto;
`

export const ResultRow = styled(Row)``

export const ResultLabel = styled(Text)`
  color: ${({ theme }) => theme.semantic.color.text.neutral700};
`

export const ResultValue = styled.span<{ children?: React.ReactNode }>`
  font-family: 'Source Code Pro', Menlo, Consolas, monospace;
  font-weight: 600;
  word-break: break-all;
`

export const ErrorText = styled(Text)`
  color: ${({ theme }) => theme.semantic.color.text.danger500};
`
