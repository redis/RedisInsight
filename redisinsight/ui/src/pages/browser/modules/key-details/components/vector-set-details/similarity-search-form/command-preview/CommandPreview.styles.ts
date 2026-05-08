import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const PreviewBar = styled(Row)`
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 12px;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral600};
  border-radius: 4px;
  background: ${({ theme }) => theme.semantic.color.background.neutral100};
`

export const PreviewText = styled.code<HTMLAttributes<HTMLElement>>`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.semantic.color.text.neutral800};
`
