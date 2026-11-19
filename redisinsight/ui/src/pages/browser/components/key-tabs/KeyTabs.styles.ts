import React from 'react'
import styled, { css } from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

// plain div: the container needs a ref to scroll the active tab into view
export const TabsContainer = styled.div<
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>
    children?: React.ReactNode
  }
>`
  display: flex;
  flex: none;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
`

export const Tab = styled(Row)<{ $isActive: boolean }>`
  flex: none;
  max-width: 24ch;
  padding: ${({ theme }) => theme.core.space.space050};
  padding-left: ${({ theme }) => theme.core.space.space150};
  border-right: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  cursor: pointer;
  user-select: none;
  outline: none;

  &:hover,
  &:focus-visible {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral300};
  }

  ${({ $isActive, theme }) =>
    $isActive &&
    css`
      color: ${theme.semantic.color.text.neutral800};
      background-color: ${theme.semantic.color.background.neutral100};
      box-shadow: inset 0 -2px 0 ${theme.semantic.color.background.primary400};

      &:hover,
      &:focus-visible {
        background-color: ${theme.semantic.color.background.neutral100};
      }
    `}
`
