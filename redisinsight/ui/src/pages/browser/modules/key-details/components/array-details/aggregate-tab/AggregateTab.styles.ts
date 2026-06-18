import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const ResultContainer = styled(Col)`
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.core.space.space150};
  overflow: auto;
`

export const ResultRow = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space150};
  border-radius: ${({ theme }) => theme.core.space.space050};
  background: ${({ theme }) => theme.semantic.color.background.neutral300};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
`

export const ResultValue = styled.span<{ children?: React.ReactNode }>`
  font-family: 'Source Code Pro', Menlo, Consolas, monospace;
  font-weight: 600;
  word-break: break-all;
`

export const ErrorRow = styled(Row)`
  color: ${({ theme }) => theme.semantic.color.text.danger500};
`
