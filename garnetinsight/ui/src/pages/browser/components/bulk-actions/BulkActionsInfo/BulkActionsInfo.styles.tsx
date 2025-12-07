import styled from 'styled-components'
import React from 'react'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'

export const BulkActionsInfoFilter = styled.div<{
  className?: string
  children?: React.ReactNode
}>`
  display: inline-flex;
  gap: ${({ theme }) => theme.core.space.space050};
  align-items: center;
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
`

export const BulkActionsTitle = styled(Text).attrs({
  size: 'M',
})<React.ComponentProps<typeof Text> & { $full?: boolean }>`
  color: ${({ theme, color }) =>
    !color && theme.semantic.color.text.informative400};
  ${({ $full }) => $full && 'width: 100%'}
`

export const BulkActionsInfoSearch = styled(ColorText).attrs({
  size: 'M',
})`
  word-break: break-all;
`

export const BulkActionsProgressLine = styled.div<{
  children?: React.ReactNode
}>`
  height: 2px;
  width: calc(100% - 24px);
  margin-top: -1px;
  & > div {
    height: 100%;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.informative300};
  }
`

export const BulkActionsContainer = styled.div<{ children: React.ReactNode }>`
  position: relative;
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  min-height: 162px;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  gap: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  display: flex;
  flex-direction: column;
`
