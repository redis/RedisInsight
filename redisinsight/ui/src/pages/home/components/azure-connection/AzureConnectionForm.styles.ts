import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space200};
`

export const UserInfo = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border-radius: ${({ theme }) => theme.core.space.space100};
`

export const DatabaseItem = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space200};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space100};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral100};
  }
`

export const DatabaseList = styled(Col)`
  max-height: 400px;
  overflow-y: auto;
`

export const TypeBadge = styled.span<{ $type: 'standard' | 'enterprise' }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: ${({ $type, theme }) =>
    $type === 'enterprise'
      ? theme.semantic.color.background.notice100
      : theme.semantic.color.background.primary100};
  color: ${({ $type, theme }) =>
    $type === 'enterprise'
      ? theme.semantic.color.text.notice
      : theme.semantic.color.text.primary};
`
