import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { CodeText } from 'uiSrc/components/base/text'

export const Container = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space100};
  min-width: 280px;
`

export const TimestampOutput = styled(Col)`
  border-top: 1px solid ${({ theme }) => theme.semantic.color.border.neutral300};
  padding-top: ${({ theme }) => theme.core.space.space150};
`

export const TimestampRow = styled(Row)`
  gap: ${({ theme }) => theme.core.space.space100};
`

export const TimestampValue = styled(CodeText)`
  flex: 1;
`
